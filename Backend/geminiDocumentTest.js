require("dotenv").config();

const { analyzeDocument } = require("./services/geminiService");

async function testDocumentAnalysis() {

    try {

        // Use one of the documents already uploaded by ProQuire
        const filePath =
    "./uploads/documents/1789471066724-843821050.png";

        const mimeType = "image/png";

        console.log("Sending document to Gemini...");
        console.log("Please wait...\n");

        const result = await analyzeDocument(
            filePath,
            mimeType
        );

        console.log("Gemini analysis result:");
        console.log(result);

    } catch (error) {

        console.error("Document analysis test failed:");
        console.error(error.message);

    }

}

testDocumentAnalysis();