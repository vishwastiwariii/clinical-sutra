import client from "../config/qdrant.js"
import createEmbeddings from "./embeddings.service.js"


export async function semanticSearchTrial({
    q
}){

    const queryVector = await createEmbeddings(q)

    const searchResults = await client.search('clinical_trials', {
        vector: queryVector.data[0].embedding,
        limit: 3, 
        with_payload: true, 
        score_threshold: 0.2
    })


    const results = searchResults.map((match) => ({
        id: match.id,
        score: match.score,
        payload: match.payload
    }))


    return {
        originalQuery: q, 
        results: results
    }
}