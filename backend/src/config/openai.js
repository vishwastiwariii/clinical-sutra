import OpenAI from 'openai'
import 'dotenv/config'

const apiKey = process.env['OPENAI_API_KEY']

const missingKey = async () => { throw new Error('Missing OPENAI_API_KEY') }

const client = apiKey
    ? new OpenAI({
        apiKey
      })
    : {
        embeddings: { create: missingKey },
        chat: { completions: { create: missingKey } }
      }

export default client
