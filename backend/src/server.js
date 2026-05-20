import express from 'express'
import 'dotenv/config' 
import pool from "./config/db.js"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())


app.get("/", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({

      message: "Database connected",

      time: result.rows[0],

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Database connection failed",

    });

  }

});

app.get('/status', async (req, res) => {
    res.json({
        status: 'ok'
    })
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
