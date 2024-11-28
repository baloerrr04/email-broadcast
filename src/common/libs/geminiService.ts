import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';


const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path: string, mimeType: string) {

    if (!path) return

    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;

    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "Generate an email template with a clear 'subject' and 'content'. The 'subject' should be wrapped only in an <h4> tag, and the 'content' should consist of HTML tags (such as <h4>, <p>, <ul>, etc.) to structure the email. Do not include any CSS styles or <html>, <head>, or <body> tags. Only use HTML tags for structuring the email content. Don't use '```' too. Don't include tag <img> too. Return both 'subject:' and 'content:' as separate",
});

const generationConfig = {
    temperature: 0.1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function generateGemini(textPrompt: string | null = null, imagePath: string | null = null) {
    const files = [];

    // Upload the image if imagePath is provided
    if (imagePath) {
        const imageData = await uploadToGemini(imagePath, "image/jpeg");
        if (imageData) {
            files.push(imageData);
        }
    }

    const finalTextPrompt = textPrompt || (files.length > 0 ? "Buatkan email template dari gambar tersebut" : "");

    const history = [];

    if (files.length > 0) {
        history.push({
            role: "user",
            parts: files.map((file) => ({
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            })),
        });
    }

    if (finalTextPrompt) {
        history.push();
    }

    const chatSession = model.startChat({
        generationConfig,
        history,
    });

    const result = await chatSession.sendMessage(finalTextPrompt);

    return result.response.text();
}

export default generateGemini;

