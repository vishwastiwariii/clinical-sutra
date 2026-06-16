import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    enableChannelBinding: process.env.DATABASE_URL.includes('channel_binding=require'),
} : {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}

const pool = new Pool(poolConfig)

export default pool
 
