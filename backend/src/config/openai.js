import OpenAI from 'openai'
import 'dotenv/config'

const apiKey = process.env['OPENAI_API_KEY']

const client = apiKey
    ? new OpenAI({
        apiKey
      })
    : {
        embeddings: {
          create: async () => {
            throw new Error('Missing OPENAI_API_KEY')
          }
        }
      }

export default client
