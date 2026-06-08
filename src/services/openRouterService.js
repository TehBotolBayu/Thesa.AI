import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { logDev } from "../lib/logger";

/**
 * Helper to initialize the OpenRouter LLM model using Langchain.
 */
const getOpenRouterModel = () => {
    return new ChatOpenAI({
        modelName: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
        temperature: 0,
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
                "X-Title": "Thesa.AI",
            }
        }
    });
};

/**
 * Converts a simple chat history array into Langchain message objects.
 * Expects chat_history to be an array of objects: { role: 'user' | 'assistant' | 'system', content: string }
 */
const parseChatHistory = (chat_history) => {
    return chat_history.map(msg => {
        if (msg.role === 'user') return new HumanMessage(msg.content);
        if (msg.role === 'system') return new SystemMessage(msg.content);
        if (msg.role === 'assistant') return new AIMessage(msg.content);
        return new HumanMessage(msg.content);
    });
};

/**
 * LLM Completion function.
 * @param {Array<{role: string, content: string}>} chat_history_input 
 * @returns {Promise<string>} The answer string.
 */
export const llm_completion = async (chat_history_input) => {
    logDev(`[openRouterService] llm_completion called with ${chat_history_input.length} messages`);
    const model = getOpenRouterModel();
    const messages = parseChatHistory(chat_history_input);

    try {
        const response = await model.invoke(messages);
        logDev("[openRouterService] llm_completion generated answer:", response.content);
        return response.content;
    } catch (error) {
        console.error("[openRouterService] ❌ LLM call FAILED:", error);
        throw error;
    }
};

/**
 * LLM JSON Completion function.
 * Implements a retry mechanism in case the returned value is not valid JSON.
 * @param {Array<{role: string, content: string}>} chat_history 
 * @param {Object|string} json_schema The expected JSON schema.
 * @param {number} max_retries Maximum number of retries upon parsing error.
 * @returns {Promise<string>} The valid JSON answer as a string.
 */
export const llm_json_completion = async (chat_history, json_schema, max_retries = 3) => {
    logDev(`[openRouterService] llm_json_completion called with ${chat_history.length} messages`);
    const model = getOpenRouterModel();
    
    const schemaString = typeof json_schema === 'string' ? json_schema : JSON.stringify(json_schema, null, 2);
    
    // Add a strict system prompt instruction for JSON output
    const systemInstruction = new SystemMessage(
        `You must respond with valid JSON only. Do not wrap the JSON in markdown blocks like \`\`\`json. ` +
        `The JSON must strictly adhere to the following schema:\n${schemaString}`
    );

    let messages = [systemInstruction, ...parseChatHistory(chat_history)];
    let attempt = 0;

    while (attempt < max_retries) {
        attempt++;
        logDev(`[openRouterService] LLM JSON request attempt ${attempt}/${max_retries}...`);
        
        try {
            const response = await model.invoke(messages);
            let content = response.content.trim();
            
            // Clean up common markdown wrapping if present
            if (content.startsWith('```json')) {
                content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (content.startsWith('```')) {
                content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }

            // Verify if it's valid JSON
            const parsed = JSON.parse(content);
            logDev(`[openRouterService] ✅ LLM JSON successfully generated on attempt ${attempt}`);
            logDev("[openRouterService] llm_json_completion generated answer:", content);
            
            // Return the stringified JSON
            return JSON.stringify(parsed);

        } catch (error) {
            console.error(`[openRouterService] ❌ JSON parse error on attempt ${attempt}:`, error.message);
            
            if (attempt >= max_retries) {
                throw new Error(`Failed to generate valid JSON after ${max_retries} attempts. Last error: ${error.message}`);
            }

            // Append the error to the chat history and ask for a correction
            messages.push(new AIMessage("Failed to parse JSON on my last attempt."));
            messages.push(new HumanMessage(
                `Your previous response resulted in a JSON parsing error: "${error.message}". ` + 
                `Please try again. You MUST return strictly valid JSON matching this schema:\n${schemaString}\n` +
                `Do not include any conversational text or markdown formatting.`
            ));
        }
    }
};
