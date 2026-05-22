import express from 'express'
import trialRoutes from './routes/trial.routes.js'

const app = express() 

app.use(express.json({limit: "1mb"}))

app.use(express.urlencoded({extended: true, limit: "1mb"}))

app.use('/api/trials', trialRoutes)

export default app