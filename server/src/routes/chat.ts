import { Router, Request, Response } from 'express'
import { chat } from '../services/gemini'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Il campo "message" è obbligatorio' })
      return
    }

    const response = await chat(message, history || [])
    res.json({ response })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router
