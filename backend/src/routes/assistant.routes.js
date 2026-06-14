import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { ragSearchTrials } from '../controllers/rag.controller.js'

const router = express.Router()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes"
})

router.post('/', limiter, ragSearchTrials)

export default router