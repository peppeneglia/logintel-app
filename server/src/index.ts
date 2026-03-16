import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat'
import predictRouter from './routes/predict'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/predict', predictRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Logintel API running on port ${PORT}`)
})
