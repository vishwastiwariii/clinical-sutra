import express from 'express'
import trialRoutes from './routes/trial.routes.js'
import searchRoutes from './routes/search.routes.js'
import semanticSearchRoutes from './routes/semanticSearch.routes.js'
import ragSearchRoutes from './routes/assistant.routes.js'

const app = express() 

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
})

app.use(express.json({limit: "1mb"}))

app.use(express.urlencoded({extended: true, limit: "1mb"}))

app.use('/trials', trialRoutes)
app.use('/search', searchRoutes)
app.use('/semantic-search', semanticSearchRoutes)
app.use('/assistant', ragSearchRoutes)

export default app