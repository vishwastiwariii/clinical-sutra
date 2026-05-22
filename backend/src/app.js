import express from 'express'
import trialRoutes from './routes/trial.routes.js'
import searchRoutes from './routes/search.routes.js'

const app = express() 

app.use(express.json({limit: "1mb"}))

app.use(express.urlencoded({extended: true, limit: "1mb"}))

app.use('/trials', trialRoutes)
app.use('/search', searchRoutes)

export default app