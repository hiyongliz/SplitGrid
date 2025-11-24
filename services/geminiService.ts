import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client with the API key from the environment
// Note: In a real production app, ensure this key is guarded or proxied.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Analyzes an image to provide a short summary and a suggested filename prefix.
 * @param base64Image The base64 encoded image string (without the data:image/... prefix)
 * @param mimeType The mime type of the image
 */
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image. Provide a very brief summary (max 10 words) describing the main subject. 
                   Also provide a short, hyphenated, safe-for-filename string that represents the image content (e.g., 'sunset-mountains', 'red-sports-car').`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestedFilename: { type: Type.STRING },
          },
          required: ["summary", "suggestedFilename"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      summary: "Image analysis failed.",
      suggestedFilename: "split-image",
    };
  }
};