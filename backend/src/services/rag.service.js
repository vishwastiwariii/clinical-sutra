import { buildContext } from "./context.service.js";
import { generateAnswer } from "./llm.service.js";
import { semanticSearchTrial } from "./semanticSearch.service.js";



export async function answerQuestion(question){
    const trials = await semanticSearchTrial({ q: question })

    const context = await buildContext(trials.results)

    const answer = await generateAnswer(
        question, 
        context
    )

    const sources = trials.results.map((r) => ({
        title: r.payload.title,
        trialId: r.payload.trialId,
        nctId: r.payload.nctId, 
        score: r.score
    })
    )

    return {
        answer, 
        sources
    }
}