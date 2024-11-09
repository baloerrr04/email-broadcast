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
    systemInstruction: "subject and content output for one email template",
});

const generationConfig = {
    temperature: 0.1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(textPrompt: string) {
    let files = [];

    const imageData = await uploadToGemini("", "image/jpeg")

    if (imageData) {
        files.push(imageData)
    }


    const chatSession = model.startChat({
        generationConfig,
        history: files.length > 0 ? [
            {
                role: "user",
                parts: [
                    {
                        fileData: {
                            mimeType: files[0].mimeType,
                            fileUri: files[0].uri,
                        },
                    },
                ],
            },
        ] : [],
    });

    const result = await chatSession.sendMessage(textPrompt);
    console.log(result.response.text());
}

run("anjay");
