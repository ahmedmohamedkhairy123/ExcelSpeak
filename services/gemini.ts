
import { GoogleGenAI, Type } from "@google/genai";
import { PredictiveInsight } from "../types";

export interface AgentResponse {
    sql: string;
    explanation: string;
    insights: PredictiveInsight;
}

/**
 * Orchestrates a single multi-stage analytical request to Gemini.
 * Uses 'gemini-3-flash-preview' for higher rate limits and faster response times.
 */
export const processAgentRequest = async (prompt: string, schema: string, dataSample: any[]): Promise<AgentResponse> => {
    // Use the environment-provided API key as per security guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Provide the model with enough context to be accurate without exceeding token limits.
    const dataSummary = JSON.stringify(dataSample.slice(0, 15));

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
      You are a world-class Data Scientist and SQL Architect. 
      Database Schema:
      ${schema}

      Recent Data Context (Sample Rows):
      ${dataSummary}

      User Query: "${prompt}"

      Task:
      Perform a complete data analysis cycle in one response:
      1. Write a precise SQLite query to answer the query.
      2. Explain the logic in simple, jargon-free business terms.
      3. Provide a forward-looking predictive insight, a confidence score (0-1), reasoning, and a "What-If" scenario based on the probable result of this query.

      Output Requirements:
      - The SQL must be valid SQLite syntax.
      - Return the result strictly as a JSON object.
    `,
        config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sql: { type: Type.STRING, description: "The executable SQLite query." },
                    explanation: { type: Type.STRING, description: "Plain English explanation of the data approach." },
                    insights: {
                        type: Type.OBJECT,
                        properties: {
                            prediction: { type: Type.STRING, description: "Trend forecast or prediction." },
                            confidence: { type: Type.NUMBER, description: "Confidence level between 0 and 1." },
                            reasoning: { type: Type.STRING, description: "Logic behind the prediction." },
                            whatIf: { type: Type.STRING, description: "Actionable scenario suggestion." }
                        },
                        required: ["prediction", "confidence", "reasoning", "whatIf"]
                    }
                },
                required: ["sql", "explanation", "insights"]
            }
        }
    });

    try {
        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        return JSON.parse(text);
    } catch (e: any) {
        console.error("Critical: Failed to process AI response", e);
        // If it's still a quota error, provide a more helpful message
        if (e.message?.includes('429')) {
            throw new Error("Quota exceeded. Please wait a moment or check your API billing status.");
        }
        throw new Error("The AI model was unable to generate a valid analysis package. Please refine your query.");
    }
};
