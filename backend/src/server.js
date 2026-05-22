import express from 'express'
import 'dotenv/config' 
import pool from "./config/db.js"
import app from './app.js'

const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/status', async (req, res) => {
    res.json({
        status: 'ok'
    })
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
