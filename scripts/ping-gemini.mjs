import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY missing");

const genai = new GoogleGenerativeAI(apiKey);
const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

const r = await model.generateContent([{ text: "Say OK" }]);
console.log(r.response.text());
