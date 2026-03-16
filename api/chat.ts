import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `Sei un assistente AI specializzato in logistica europea per fleet manager e spedizionieri. Rispondi solo a domande riguardanti trasporti su strada, gestione flotte, pianificazione percorsi, condizioni meteo stradali, normative di trasporto europee (tempi di guida, tachigrafi, ADR), e ottimizzazione logistica. Se ti viene posta una domanda non attinente, rispondi educatamente che sei specializzato solo in logistica europea. Rispondi sempre in italiano, con tono professionale ed esperto, in massimo 3 paragrafi.`

interface ChatMessage {
  role: string
  content: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { message, history } = req.body as {
    message: string
    history: ChatMessage[]
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    const contents = [
      ...(history || []).map((msg: ChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      return res.status(502).json({ error: 'Errore nella chiamata a Gemini' })
    }

    const data = await response.json()
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Mi dispiace, non sono riuscito a generare una risposta. Riprova.'

    return res.status(200).json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}
