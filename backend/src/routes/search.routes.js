import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { getSearchTrials } from '../controllers/search.controller.js'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes"
})

const router = express.Router()

router.get('/', limiter, getSearchTrials)

export default router
