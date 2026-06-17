import dotenv from 'dotenv'
import { QdrantClient } from "@qdrant/js-client-rest"

dotenv.config()

const client = new QdrantClient({
  url: process.env.QDRANT_HOST || "localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
})

try {
    const result = await client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}

export default client