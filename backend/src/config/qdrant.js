import 'dotenv/config'
import { QdrantClient } from "@qdrant/js-client-rest"

const client = new QdrantClient({
  host: process.env.QDRANT_HOST || "localhost",
  port: parseInt(process.env.QDRANT_PORT) || 6333,
  checkCompatibility: false,
})

export default client
