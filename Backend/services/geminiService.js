require("dotenv").config();

const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

// ======================================================
// Gemini AI Client
// ======================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ======================================================
// Gemini Model Configuration
// ======================================================

// Primary model
const PRIMARY_MODEL = "gemini-3.6-flash";

// Fallback model
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

// Number of attempts for each model
const PRIMARY_MAX_ATTEMPTS = 3;
const FALLBACK_MAX_ATTEMPTS = 2;


// ======================================================
// Wait Helper
// ======================================================

function sleep(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}


// ======================================================
// Determine Whether Error Is Temporary
// ======================================================

function isRetryableError(error) {

    const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

    return [
        429,
        500,
        502,
        503,
        504
    ].includes(Number(status));

}


// ======================================================
// Get Error Status
// ======================================================

function getErrorStatus(error) {

    return (
        error?.status ||
        error?.code ||
        error?.response?.status ||
        null
    );

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

async function sendToGemini(
    model,
    prompt,
    base64Data,
    mimeType,
    maxAttempts
) {

    let lastError = null;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            console.log("");
            console.log(
                `Gemini model: ${model}`
            );

            console.log(
                `Gemini attempt: ${attempt}/${maxAttempts}`
            );

            const response =
                await ai.models.generateContent({

                    model: model,

                    contents: [

                        {
                            text: prompt
                        },

                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }

                    ],

                    config: {

                        responseMimeType:
                            "application/json",

                        responseSchema: {

                            type: "object",

                            properties: {

                                verification_result: {

                                    type: "string",

                                    enum: [
                                        "approved",
                                        "rejected",
                                        "review"
                                    ]

                                },

                                confidence_score: {

                                    type: "number"

                                },

                                document_type: {

                                    type: "string"

                                },

                                remarks: {

                                    type: "string"

                                }

                            },

                            required: [

                                "verification_result",
                                "confidence_score",
                                "document_type",
                                "remarks"

                            ]

                        }

                    }

                });

            console.log(
                `Gemini request succeeded using ${model}.`
            );

            return response;

        } catch (error) {

            lastError = error;

            const status =
                getErrorStatus(error);

            console.error("");

            console.error(
                `Gemini ${model} attempt ${attempt} failed.`
            );

            console.error(
                "Status:",
                status
            );

            console.error(
                "Message:",
                getErrorMessage(error)
            );


            // ------------------------------------------
            // If the error is not temporary,
            // stop immediately.
            // ------------------------------------------

            if (!isRetryableError(error)) {

                console.error(
                    "This error is not retryable."
                );

                throw error;

            }


            // ------------------------------------------
            // If this was the final attempt,
            // allow fallback model to be tried.
            // ------------------------------------------

            if (attempt === maxAttempts) {

                console.error(
                    `All attempts failed for ${model}.`
                );

                break;

            }


            // ------------------------------------------
            // Exponential backoff
            //
            // Attempt 1 -> wait 2 seconds
            // Attempt 2 -> wait 4 seconds
            // Attempt 3 -> wait 8 seconds
            // ------------------------------------------

            const delay =
                Math.pow(2, attempt) * 1000;

            console.log(
                `Waiting ${delay / 1000} seconds before retry...`
            );

            await sleep(delay);

        }

    }

    throw lastError;

}


// ======================================================
// Analyze Verification Document
// ======================================================

async function analyzeDocument(
    filePath,
    mimeType
) {

    try {

        // ==================================================
        // Validate Gemini API Key
        // ==================================================

        if (!process.env.GEMINI_API_KEY) {

            throw new Error(
                "GEMINI_API_KEY is not configured in the backend .env file."
            );

        }


        // ==================================================
        // Validate File Path
        // ==================================================

        if (!filePath) {

            throw new Error(
                "No verification document file path was provided."
            );

        }


        if (!fs.existsSync(filePath)) {

            throw new Error(
                `Verification document file does not exist: ${filePath}`
            );

        }


        // ==================================================
        // Validate MIME Type
        // ==================================================

        if (!mimeType) {

            throw new Error(
                "The uploaded document does not have a valid MIME type."
            );

        }


        // ==================================================
        // File Information
        // ==================================================

        const fileStats =
            fs.statSync(filePath);

        const fileSize =
            fileStats.size;


        console.log("");
        console.log(
            "------------------------------------------"
        );

        console.log(
            "GEMINI DOCUMENT ANALYSIS"
        );

        console.log(
            "------------------------------------------"
        );

        console.log(
            "File:",
            filePath
        );

        console.log(
            "MIME type:",
            mimeType
        );

        console.log(
            "File size:",
            fileSize,
            "bytes"
        );

        console.log(
            "Primary model:",
            PRIMARY_MODEL
        );

        console.log(
            "Fallback model:",
            FALLBACK_MODEL
        );

        console.log(
            "------------------------------------------"
        );


        // ==================================================
        // Read Uploaded Document
        // ==================================================

        const fileData =
            fs.readFileSync(filePath);


        // ==================================================
        // Convert File To Base64
        // ==================================================

        const base64Data =
            fileData.toString("base64");


        // ==================================================
        // AI Prompt
        // ==================================================

        const prompt = `
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


        // ==================================================
        // TRY PRIMARY MODEL
        // ==================================================

        console.log(
            "Sending document to Gemini primary model..."
        );


        let response;

        try {

            response =
                await sendToGemini(
                    PRIMARY_MODEL,
                    prompt,
                    base64Data,
                    mimeType,
                    PRIMARY_MAX_ATTEMPTS
                );

        } catch (primaryError) {

            const primaryStatus =
                getErrorStatus(primaryError);


            console.error("");

            console.error(
                "=========================================="
            );

            console.error(
                "PRIMARY GEMINI MODEL FAILED"
            );

            console.error(
                "=========================================="
            );

            console.error(
                "Model:",
                PRIMARY_MODEL
            );

            console.error(
                "Status:",
                primaryStatus
            );

            console.error(
                "Message:",
                getErrorMessage(primaryError)
            );


            // ==================================================
            // FALLBACK MODEL
            // ==================================================

            if (
                isRetryableError(primaryError)
            ) {

                console.log("");

                console.log(
                    "Primary Gemini model is temporarily unavailable."
                );

                console.log(
                    "Switching to fallback model..."
                );

                console.log(
                    "Fallback model:",
                    FALLBACK_MODEL
                );


                try {

                    response =
                        await sendToGemini(
                            FALLBACK_MODEL,
                            prompt,
                            base64Data,
                            mimeType,
                            FALLBACK_MAX_ATTEMPTS
                        );

                } catch (fallbackError) {

                    console.error("");

                    console.error(
                        "=========================================="
                    );

                    console.error(
                        "FALLBACK GEMINI MODEL FAILED"
                    );

                    console.error(
                        "=========================================="
                    );

                    console.error(
                        "Model:",
                        FALLBACK_MODEL
                    );

                    console.error(
                        "Status:",
                        getErrorStatus(
                            fallbackError
                        )
                    );

                    console.error(
                        "Message:",
                        getErrorMessage(
                            fallbackError
                        )
                    );

                    console.error(
                        "=========================================="
                    );

                    // Re-throw fallback error
                    // so technicianController handles
                    // the failed AI analysis.
                    throw fallbackError;

                }

            } else {

                // Non-retryable primary error.
                // Do not unnecessarily try another model.

                throw primaryError;

            }

        }


        // ==================================================
        // Make Sure Gemini Returned Something
        // ==================================================

        if (!response) {

            throw new Error(
                "Gemini returned no response."
            );

        }


        const resultText =
            response.text;


        console.log("");

        console.log(
            "Gemini response received."
        );

        console.log(
            "Gemini raw response:",
            resultText
        );


        // ==================================================
        // Validate Response
        // ==================================================

        if (!resultText) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        // ==================================================
        // Parse JSON
        // ==================================================

        let parsedResult;

        try {

            parsedResult =
                JSON.parse(
                    resultText.trim()
                );

        } catch (parseError) {

            console.error(
                "Gemini JSON parsing failed."
            );

            console.error(
                "Raw Gemini response:",
                resultText
            );

            throw new Error(
                "Gemini returned an invalid JSON response."
            );

        }


        // ==================================================
        // Validate verification_result
        // ==================================================

        if (

            !parsedResult.verification_result ||

            ![
                "approved",
                "rejected",
                "review"
            ].includes(
                parsedResult.verification_result
            )

        ) {

            throw new Error(
                "Gemini returned an invalid verification_result."
            );

        }


        // ==================================================
// Validate confidence_score
// ==================================================

if (
    typeof parsedResult.confidence_score !== "number" ||
    Number.isNaN(parsedResult.confidence_score)
) {

    throw new Error(
        "Gemini returned an invalid confidence_score."
    );

}


// ==================================================
// Normalize confidence score
// ==================================================
//
// Gemini may sometimes return confidence as a
// decimal between 0 and 1:
//
//     0.5  -> 50
//     0.75 -> 75
//     0.95 -> 95
//
// If Gemini already returns a value between 0 and 100,
// keep it as-is:
//
//     50 -> 50
//     75 -> 75
//     95 -> 95
//

let confidenceScore =
    parsedResult.confidence_score;

if (
    confidenceScore >= 0 &&
    confidenceScore <= 1
) {

    confidenceScore =
        confidenceScore * 100;

}


// ==================================================
// Keep confidence between 0 and 100
// ==================================================

confidenceScore =
    Math.max(
        0,
        Math.min(
            100,
            confidenceScore
        )
    );


// ==================================================
// Round confidence score
// ==================================================

parsedResult.confidence_score =
    Math.round(confidenceScore);


        // ==================================================
        // Validate document_type
        // ==================================================

        if (
            !parsedResult.document_type
        ) {

            throw new Error(
                "Gemini did not return a document_type."
            );

        }


        // ==================================================
        // Validate remarks
        // ==================================================

        if (
            !parsedResult.remarks
        ) {

            throw new Error(
                "Gemini did not return remarks."
            );

        }


        // ==================================================
        // Successful Result
        // ==================================================

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "GEMINI DOCUMENT ANALYSIS SUCCESSFUL"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "Verification result:",
            parsedResult.verification_result
        );

        console.log(
            "Confidence score:",
            parsedResult.confidence_score
        );

        console.log(
            "Document type:",
            parsedResult.document_type
        );

        console.log(
            "Remarks:",
            parsedResult.remarks
        );

        console.log(
            "=========================================="
        );

        console.log("");


        return parsedResult;


    } catch (error) {

        // ==================================================
        // Final Error Logging
        // ==================================================

        console.error("");

        console.error(
            "=========================================="
        );

        console.error(
            "GEMINI DOCUMENT ANALYSIS FAILED"
        );

        console.error(
            "=========================================="
        );

        console.error(
            "Message:",
            getErrorMessage(error)
        );

        console.error(
            "Name:",
            error?.name
        );

        console.error(
            "Status:",
            getErrorStatus(error)
        );


        if (error?.code) {

            console.error(
                "Code:",
                error.code
            );

        }


        if (error?.response) {

            console.error(
                "Response:",
                error.response
            );

        }


        console.error(
            "Full error:",
            error
        );

        console.error(
            "=========================================="
        );

        console.error("");


        throw error;

    }

}


// ======================================================
// Export
// ======================================================

module.exports = {
    analyzeDocument
};