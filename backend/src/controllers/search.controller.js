import { searchTrialService } from "../services/search.service.js"

export const getSearchTrials = async (req, res) => {
    try {
        const {
            q = "", 
            page = 1, 
            limit = 10, 
            status, 
            phase
        } = req.query 

        const parsedPage = parseInt(page)
        const parsedLimit = parseInt(limit)

        if(parsedPage < 1 || parsedLimit < 1){
            return res.status(400).json({
                error: "Invalid Pagination Value"
            })
        }

        const result = await searchTrialService({q, page: parsedPage, limit: parsedLimit, status, phase})

        return res.status(200).json({
            success: true,
            result
        })

    } catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Sever Error",
            error: error.message
        })
    }
}