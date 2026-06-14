import OpenAI from "openai";
import { buildContext } from "./context.service.js";


const client = new OpenAI()


export async function generateAnswer(question, context){
    const systemPrompt = `
            You are a clinical trial research assistant.

            Answer ONLY using the provided clinical trial evidences.

            If the evidence is insufficient, say so explicitly.

            Do not invent medical facts.

            Always mention the trial titles you used for deciding your output.
        `

    const userPrompt = `
            Question: ${question}
            Clinical Trial Evidence: 
            ${context}
        `

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
            {role: "system", content: systemPrompt},
            {role: "user", content: userPrompt}
        ], 
        temperature: 0.1
    })

    return response.choices[0].message.content
}