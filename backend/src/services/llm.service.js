import client from "../config/openai.js"


export async function generateAnswer(question, context){
    const systemPrompt = `
            You are a clinical trial research assistant.

            Answer ONLY using the provided clinical trial evidences.

            If the evidence is insufficient, say so explicitly.

            Do not invent medical facts.

            When comparing studies, prioritize:
            1. Recruiting status
            2. Phase
            3. Study type
            4. Conditions.

            Clearly distinguish recruiting and completed studies.



            Always mention the trial titles you used for deciding your output.

            When mentioning a trial, always include:
            - Title
            - NCT ID
            - Status
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