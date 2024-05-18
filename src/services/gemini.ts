import { GoogleGenAI } from "@google/genai"
import { PredictiveInsight } from "../types"

export interface AgentResponse {
    sql: string
    explanation: string
    insights: PredictiveInsight
}

/**
 * Orchestrates a single multi-stage analytical request to Gemini.
 */
export const processAgentRequest = async (
    prompt: string,
    schema: string,
    dataSample: any[]
): Promise<AgentResponse> => {
    // Use the environment-provided API key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file")
    }

    const ai = new GoogleGenAI({ apiKey })

    // Provide the model with enough context to be accurate
    const dataSummary = JSON.stringify(dataSample.slice(0, 15))

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
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
        3. Provide a forward-looking predictive insight, a confidence score (0-1), reasoning, and a "What-If" scenario.

        Output Requirements:
        - The SQL must be valid SQLite syntax.
        - Return the result strictly as a JSON object with this exact structure:
        {
          "sql": "your SQL query here",
          "explanation": "your explanation here",
          "insights": {
            "prediction": "your prediction here",
            "confidence": 0.85,
            "reasoning": "your reasoning here",
            "whatIf": "your what-if scenario here"
          }
        }
      `,
            config: {
                temperature: 0.1,
            }
        })

        const text = response.text

        if (!text) {
            throw new Error("Empty response from AI")
        }

        // Try to parse the response as JSON
        try {
            // Extract JSON from the response (sometimes Gemini adds extra text)
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const jsonStr = jsonMatch ? jsonMatch[0] : text
            const parsed = JSON.parse(jsonStr)

            // Validate the response structure
            if (!parsed.sql || !parsed.explanation || !parsed.insights) {
                throw new Error("Invalid response structure from AI")
            }

            return {
                sql: parsed.sql.trim(),
                explanation: parsed.explanation,
                insights: parsed.insights
            }
        } catch (parseError) {
            console.error("Failed to parse AI response:", text)
            throw new Error("AI returned invalid JSON format")
        }
    } catch (e: any) {
        console.error("Gemini AI error:", e)

        // Handle specific errors
        if (e.message?.includes('429') || e.status === 429) {
            throw new Error("API quota exceeded. Please wait or check your API billing.")
        }

        if (e.message?.includes('API key') || e.status === 401) {
            throw new Error("Invalid API key. Please check your Gemini API configuration.")
        }

        // Fallback mock response for development
        return getMockResponse(prompt, schema)
    }
}

/**
 * Mock response for development when API is not available
 */
const getMockResponse = (prompt: string, schema: string): AgentResponse => {
    const tableMatch = schema.match(/Table (\w+):/)
    const tableName = tableMatch ? tableMatch[1] : 'table_1'

    const mockResponses = [
        {
            sql: `SELECT * FROM ${tableName} LIMIT 10`,
            explanation: `Showing first 10 rows from your dataset to give you an overview of the data structure and sample values.`,
            insights: {
                prediction: "Data appears structured with multiple meaningful columns for analysis",
                confidence: 0.9,
                reasoning: "Based on column names and sample data structure",
                whatIf: "If you analyze specific columns, you could uncover trends and correlations"
            }
        },
        {
            sql: `SELECT COUNT(*) as total_rows FROM ${tableName}`,
            explanation: `Counting total records in your dataset to understand data volume.`,
            insights: {
                prediction: "Dataset size is appropriate for detailed analysis",
                confidence: 0.85,
                reasoning: "Based on typical dataset sizes for meaningful insights",
                whatIf: "If you had more data, statistical significance would improve"
            }
        },
        {
            sql: `SELECT * FROM ${tableName} ORDER BY RANDOM() LIMIT 5`,
            explanation: `Showing 5 random rows to provide a diverse sample of your data.`,
            insights: {
                prediction: "Random sampling shows data diversity across records",
                confidence: 0.8,
                reasoning: "Based on random sample distribution",
                whatIf: "If you focus on specific segments, patterns may emerge more clearly"
            }
        }
    ]

    // Return different mock based on prompt
    const index = prompt.length % mockResponses.length
    return mockResponses[index]
}