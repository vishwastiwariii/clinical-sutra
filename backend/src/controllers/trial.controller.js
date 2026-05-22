import { getAllTrial } from "../services/trial.service.js"
import { getTrialById } from "../services/trial.service.js"

export const getAllTrials = async (req, res) => {

  try {

    const limit = parseInt(req.query.limit) || 10; 
    const cursor = parseInt(req.query.cursor) || 0; 

    const trials = await getAllTrial(limit, cursor)

    const nextCursor =

        trials.length > 0

            ? trials[trials.length - 1].id

            : null;

    return res.status(200).json({
        success: true, 
        data: trials, 
        nextCursor,   ///frontend will store nextCursor and next request me automatically will send this 
        message: 'Trials fetched successfully'
    })
  } catch (error) {
    console.error('Error in getAllTrials:', error)
    return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'An error occurred while fetching trials'
    })
  }

}


export const getTrialsById = async (req, res) => {
    try {
        const { nct_id } = req.params
        console.log(nct_id)

        const trial = await getTrialById({nct_id})

        if (!trial) {
            return res.status(404).json({
                success: false,
                message: `Trial with NCT ID ${nct_id} not found`
            })
        }

        return res.status(200).json({
                success: true,
                data: trial,
                message: 'Trial fetched successfully'
        })
    } catch (error) {
        console.error('Error in getTrialsById:', error)
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message || 'An error occurred while fetching the trial'
        })
    }
}