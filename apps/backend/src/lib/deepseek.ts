import OpenAI from 'openai'

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy_key',
  baseURL: 'https://api.deepseek.com',
})

export const DEEPSEEK_MODEL = 'deepseek-flash'