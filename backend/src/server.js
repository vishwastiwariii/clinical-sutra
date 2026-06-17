import 'dotenv/config'
import pool from "./config/db.js"
import app from './app.js'

const PORT = process.env.PORT || 3000

app.get('/health', async (req, res) => {
    res.json({
        status: 'ok'
    })
})

const server = app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})

process.on('SIGTERM', () => {
    server.close(async () => {
        await pool.end()
    })
})
