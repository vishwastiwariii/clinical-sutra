import client from "../config/openai.js";

export default async function createEmbeddings(text = ""){
    const model = "text-embedding-3-small"
    const input = Array.isArray(text)
        ? text.map((item) => String(item).trim())
        : String(text).trim()

    const embedding = await client.embeddings.create({
        input,
        model: model
    })

    return embedding
}
