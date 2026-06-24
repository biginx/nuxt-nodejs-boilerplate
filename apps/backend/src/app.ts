import express, { type Express } from 'express'
import cors from 'cors'
import { registerRoutes } from '@/routes/index.js'

const app: Express = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

registerRoutes(app)

export default app
