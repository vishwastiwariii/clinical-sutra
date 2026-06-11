import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { semanticSearch } from '../controllers/semanticSearch.controller.js'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes"
})

const router = express.Router()

router.get('/', limiter, semanticSearch)

export default router