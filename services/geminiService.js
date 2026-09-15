require("dotenv").config();

const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function analyzeDocument(filePath, mimeType) {

    try {

        // Read the uploaded document
        const fileData = fs.readFileSync(filePath);

        // Convert the document to Base64
        const base64Data = fileData.toString("base64");

        const prompt = `
You are an AI document screening assistant for ProQuire,
a technician and service marketplace.

Analyze the uploaded identity document.

Determine:

1. Whether the document appears to be an identity document.
2. What type of identity document it appears to be.
3. Whether the document is clear enough to inspect.
4. Whether important information appears visible.
5. Whether there are obvious signs that the document may be fake, altered, or suspicious.

Return ONLY valid JSON.

Use exactly this structure:

{
    "verification_result": "approved",
    "confidence_score": 95,
    "document_type": "National ID",
    "remarks": "The document appears clear and contains visible identification information."
}

Rules:

- verification_result must be exactly one of:
  "approved", "rejected", or "review"

- confidence_score must be a number between 0 and 100.

- document_type should describe the apparent document type.

- remarks should briefly explain the AI's assessment.

- Do not invent information that cannot be seen.

- If the document is not an identity document, use "rejected".

- If the document is unclear or you cannot confidently assess it, use "review".

- Do not make a final legal determination that a document is genuine or fraudulent.
`;

        const contents = [
            {
                text: prompt
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: contents
        });

        let result = response.text.trim();

        // Remove Markdown code fences if Gemini adds them
        result = result.replace(/```json/g, "");
        result = result.replace(/```/g, "");
        result = result.trim();

        // Extract the JSON object
        const firstBrace = result.indexOf("{");
        const lastBrace = result.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("Gemini did not return valid JSON.");
        }

        result = result.substring(
            firstBrace,
            lastBrace + 1
        );

        // Convert JSON text into a JavaScript object
        const parsedResult = JSON.parse(result);

        return parsedResult;

    } catch (error) {

        console.error("Gemini document analysis failed:");
        console.error(error.message);

        throw error;
    }
}


module.exports = {
    analyzeDocument
};