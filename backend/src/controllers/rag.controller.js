import { answerQuestion } from "../services/rag.service.js"

export const ragSearchTrials = async (req, res) => {
    try {
        const question = req.body?.question?.trim()

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'question is required'
            })
        }

        const response = await answerQuestion(question)

        return res.status(200).json({
            success: true, 
            answer: response.answer, 
            source: response.sources
        })

    } catch (error){
        console.error(error)
        return res.status(500).json({
            success: false, 
            message: "Internal Server Error",
            error: error.message
        })
    }
}