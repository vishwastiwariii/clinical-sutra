import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { getAllTrials } from '../controllers/trial.controller.js'
import { getTrialsById } from '../controllers/trial.controller.js'

const router = express.Router()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes"
})

router.get('/', limiter, getAllTrials)
router.get('/:nct_id',limiter, getTrialsById)

export default router