import { semanticSearchTrial } from "../services/semanticSearch.service.js"



export const semanticSearch = async (req, res) => {
    try {
        const { q } = req.query

        if(!q){
            return res.status(400).json({
                message: "Search Query is important"
            })
        }

        const result = await semanticSearchTrial({q})

        return res.json({result})

    } catch (error){
        console.error(error)
        return res.status(500).json({
            success: false, 
            error: "Internal Server Error",
            message: error.message
        })
    }
}