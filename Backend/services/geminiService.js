require("dotenv").config();

const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

// ======================================================
// Gemini AI Client
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// Gemini Model Configuration
// ======================================================

const PRIMARY_MODEL = "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const PRIMARY_MAX_ATTEMPTS = 3;
const FALLBACK_MAX_ATTEMPTS = 2;

// ======================================================
// Wait Helper
// ======================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ======================================================
// Determine Whether Error Is Temporary
// ======================================================

function isRetryableError(error) {
  const status = error?.status || error?.code || error?.response?.status;

  return [429, 500, 502, 503, 504].includes(Number(status));
}

// ======================================================
// Get Error Status
// ======================================================

function getErrorStatus(error) {
  return error?.status || error?.code || error?.response?.status || null;
}

// ======================================================
// Get Safe Error Message
// ======================================================

function getErrorMessage(error) {
  if (!error) {
    return "Unknown Gemini error.";
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return String(error);
}

// ======================================================
// Send Document To Gemini
// ======================================================

async function sendToGemini(model, prompt, base64Data, mimeType, maxAttempts) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log("");
      console.log(`Gemini model: ${model}`);
      console.log(`Gemini attempt: ${attempt}/${maxAttempts}`);

      const response = await ai.models.generateContent({
        model: model,

        contents: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ],

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              verification_result: {
                type: "string",
                enum: ["approved", "rejected", "review"],
              },

              confidence_score: {
                type: "number",
              },

              document_type: {
                type: "string",
              },

              remarks: {
                type: "string",
              },
            },

            required: [
              "verification_result",
              "confidence_score",
              "document_type",
              "remarks",
            ],
          },
        },
      });

      console.log(`Gemini request succeeded using ${model}.`);

      return response;
    } catch (error) {
      lastError = error;

      const status = getErrorStatus(error);

      console.error("");
      console.error(`Gemini ${model} attempt ${attempt} failed.`);
      console.error("Status:", status);
      console.error("Message:", getErrorMessage(error));

      if (!isRetryableError(error)) {
        console.error("This error is not retryable.");
        throw error;
      }

      if (attempt === maxAttempts) {
        console.error(`All attempts failed for ${model}.`);
        break;
      }

      const delay = Math.pow(2, attempt) * 1000;

      console.log(`Waiting ${delay / 1000} seconds before retry...`);

      await sleep(delay);
    }
  }

  throw lastError;
}

// ======================================================
// Build Document Prompt
// ======================================================

function buildPrompt(documentContext) {
  if (documentContext === "agency") {
    return `
You are an AI document screening assistant for ProQuire,
a technician and service marketplace operating in Kenya.

Analyze the uploaded agency business verification document.

The document may be one of the following:

- Certificate of business registration.
- Certificate of incorporation.
- KRA PIN certificate.
- County business permit.
- Other legitimate business verification document.

Determine:

1. Whether the document appears to be a business or agency
   verification document.
2. What type of document it appears to be.
3. Whether the document is clear and readable.
4. Whether important business information is visible,
   such as company name, registration number, KRA PIN,
   issuing authority or relevant dates, where applicable.
5. Whether there are obvious signs of alteration,
   manipulation, suspicious inconsistencies or missing information.

Important rules:

- Do not invent information that cannot be seen.
- Do not assume every document must contain the same information.
- Assess the document according to its apparent document type.
- Do not reject a document simply because it does not contain
  information that is not normally required for that document type.
- Do not make a final legal determination that a document
  is genuine or fraudulent.
- If the document is unrelated to agency or business verification,
  return "rejected".
- If the document is unclear or cannot confidently be assessed,
  return "review".
- If the document appears suitable for administrative verification,
  return "approved".
- An "approved" result is only an AI recommendation.
  A ProQuire administrator must make the final verification decision.
- Keep remarks short and explain the reason for the recommendation.

- confidence_score must be a percentage from 0 to 100.
- Do NOT return confidence_score as a decimal between 0 and 1.
- For example, 75% confidence must be returned as 75.

Return the assessment using the required JSON structure.
`;
  }

  return `
You are an AI document screening assistant for ProQuire,
a technician and service marketplace.

Analyze the uploaded identity document.

Determine:

1. Whether the document appears to be an identity document.
2. What type of identity document it appears to be.
3. Whether the document is clear enough to inspect.
4. Whether important identification information appears visible.
5. Whether there are obvious signs that the document may be fake,
   altered, manipulated, or suspicious.

Important rules:

- Do not invent information that cannot be seen.
- Do not make a final legal determination that a document is genuine
  or fraudulent.
- If the document is not an identity document, return "rejected".
- If the document is unclear or cannot confidently be assessed,
  return "review".
- If the document appears suitable for verification, return "approved".
- Keep the remarks short and explain the reason for the result.

- confidence_score must be returned as a percentage from 0 to 100.
- Do NOT return confidence_score as a decimal between 0 and 1.
- For example, 50% confidence must be returned as 50, not 0.5.
- 75% confidence must be returned as 75, not 0.75.
- 95% confidence must be returned as 95, not 0.95.

Return the assessment using the required JSON structure.
`;
}

// ======================================================
// Analyze Verification Document
// Supports both:
// 1. Buffer input (new Supabase upload workflow)
// 2. File path input (existing workflow)
// ======================================================

async function analyzeDocument(
  fileInput,
  mimeType,
  documentContext = "technician",
) {
  try {
    // ==================================================
    // Validate Gemini API Key
    // ==================================================

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the backend.");
    }

    // ==================================================
    // Validate File Input
    // ==================================================

    if (!fileInput) {
      throw new Error("No verification document was provided.");
    }

    // ==================================================
    // Validate MIME Type
    // ==================================================

    if (!mimeType) {
      throw new Error("The uploaded document does not have a valid MIME type.");
    }

    // ==================================================
    // Read Buffer or Existing File
    // ==================================================

    let fileData;
    let fileDescription;

    if (Buffer.isBuffer(fileInput)) {
      fileData = fileInput;
      fileDescription = "In-memory uploaded file";
    } else if (typeof fileInput === "string") {
      if (!fs.existsSync(fileInput)) {
        throw new Error(
          `Verification document file does not exist: ${fileInput}`,
        );
      }

      fileData = fs.readFileSync(fileInput);
      fileDescription = fileInput;
    } else {
      throw new Error("Invalid file input. Expected a Buffer or file path.");
    }

    if (!fileData.length) {
      throw new Error("The verification document is empty.");
    }

    const fileSize = fileData.length;

    console.log("");
    console.log("------------------------------------------");
    console.log("GEMINI DOCUMENT ANALYSIS");
    console.log("------------------------------------------");
    console.log("File:", fileDescription);
    console.log("MIME type:", mimeType);
    console.log("File size:", fileSize, "bytes");
    console.log("Primary model:", PRIMARY_MODEL);
    console.log("Fallback model:", FALLBACK_MODEL);
    console.log("------------------------------------------");

    // ==================================================
    // Convert File To Base64
    // ==================================================

    const base64Data = fileData.toString("base64");

    // ==================================================
    // Select Prompt
    // ==================================================

    const prompt = buildPrompt(documentContext);

    // ==================================================
    // Try Primary Model
    // ==================================================

    console.log("Sending document to Gemini primary model...");

    let response;

    try {
      response = await sendToGemini(
        PRIMARY_MODEL,
        prompt,
        base64Data,
        mimeType,
        PRIMARY_MAX_ATTEMPTS,
      );
    } catch (primaryError) {
      console.error("");
      console.error("==========================================");
      console.error("PRIMARY GEMINI MODEL FAILED");
      console.error("==========================================");
      console.error("Model:", PRIMARY_MODEL);
      console.error("Status:", getErrorStatus(primaryError));
      console.error("Message:", getErrorMessage(primaryError));

      if (isRetryableError(primaryError)) {
        console.log("Primary Gemini model is temporarily unavailable.");

        console.log("Switching to fallback model...");
        console.log("Fallback model:", FALLBACK_MODEL);

        try {
          response = await sendToGemini(
            FALLBACK_MODEL,
            prompt,
            base64Data,
            mimeType,
            FALLBACK_MAX_ATTEMPTS,
          );
        } catch (fallbackError) {
          console.error("FALLBACK GEMINI MODEL FAILED");
          console.error("Model:", FALLBACK_MODEL);
          console.error("Status:", getErrorStatus(fallbackError));
          console.error("Message:", getErrorMessage(fallbackError));

          throw fallbackError;
        }
      } else {
        throw primaryError;
      }
    }

    // ==================================================
    // Validate Gemini Response
    // ==================================================

    if (!response) {
      throw new Error("Gemini returned no response.");
    }

    const resultText = response.text;

    console.log("Gemini response received.");

    if (!resultText) {
      throw new Error("Gemini returned an empty response.");
    }

    // ==================================================
    // Parse JSON
    // ==================================================

    let parsedResult;

    try {
      parsedResult = JSON.parse(resultText.trim());
    } catch (parseError) {
      console.error("Gemini JSON parsing failed.");
      console.error("Raw Gemini response:", resultText);

      throw new Error("Gemini returned an invalid JSON response.");
    }

    // ==================================================
    // Validate Verification Result
    // ==================================================

    if (
      !parsedResult.verification_result ||
      !["approved", "rejected", "review"].includes(
        parsedResult.verification_result,
      )
    ) {
      throw new Error("Gemini returned an invalid verification_result.");
    }

    // ==================================================
    // Validate Confidence Score
    // ==================================================

    if (
      typeof parsedResult.confidence_score !== "number" ||
      !Number.isFinite(parsedResult.confidence_score)
    ) {
      throw new Error("Gemini returned an invalid confidence_score.");
    }

    // ==================================================
    // Normalize Confidence Score
    // ==================================================

    let confidenceScore = parsedResult.confidence_score;

    if (confidenceScore >= 0 && confidenceScore <= 1) {
      confidenceScore = confidenceScore * 100;
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    parsedResult.confidence_score = Math.round(confidenceScore);

    // ==================================================
    // Validate Document Type
    // ==================================================

    if (!parsedResult.document_type) {
      throw new Error("Gemini did not return a document_type.");
    }

    // ==================================================
    // Validate Remarks
    // ==================================================

    if (!parsedResult.remarks) {
      throw new Error("Gemini did not return remarks.");
    }

    // ==================================================
    // Successful Result
    // ==================================================

    console.log("");
    console.log("==========================================");
    console.log("GEMINI DOCUMENT ANALYSIS SUCCESSFUL");
    console.log("==========================================");
    console.log("Verification result:", parsedResult.verification_result);
    console.log("Confidence score:", parsedResult.confidence_score);
    console.log("Document type:", parsedResult.document_type);
    console.log("Remarks:", parsedResult.remarks);
    console.log("==========================================");

    return parsedResult;
  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("GEMINI DOCUMENT ANALYSIS FAILED");
    console.error("==========================================");
    console.error("Message:", getErrorMessage(error));
    console.error("Name:", error?.name);
    console.error("Status:", getErrorStatus(error));

    if (error?.code) {
      console.error("Code:", error.code);
    }

    console.error("==========================================");

    throw error;
  }
}

// ======================================================
// Export
// ======================================================

module.exports = {
  analyzeDocument,
};
