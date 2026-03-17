import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * Vite plugin: handles /api/chat in dev by calling Gemini REST API directly.
 * Replicates the Vercel serverless function (api/chat.ts).
 */
function localApiPlugin(): Plugin {
  let geminiKey = ''
  let railwayUrl = ''
  let railwayKey = ''

  return {
    name: 'local-api-dev',
    configResolved(config) {
      const env = loadEnv('', config.root, '')
      geminiKey = env.GEMINI_API_KEY || ''
      railwayUrl = env.RAILWAY_API_URL || ''
      railwayKey = env.RAILWAY_API_KEY || ''
    },
    configureServer(server) {
      // --- /api/chat → Gemini ---
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(req.method === 'OPTIONS' ? 200 : 405, { 'Content-Type': 'application/json' })
          res.end(req.method === 'OPTIONS' ? '' : JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        if (!geminiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured in .env' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const { message, history } = JSON.parse(Buffer.concat(chunks).toString())

        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Message is required' }))
          return
        }

        const systemPrompt =
          'Sei un assistente AI specializzato in logistica europea per fleet manager e spedizionieri. Rispondi solo a domande riguardanti trasporti su strada, gestione flotte, pianificazione percorsi, condizioni meteo stradali, normative di trasporto europee (tempi di guida, tachigrafi, ADR), e ottimizzazione logistica. Se ti viene posta una domanda non attinente, rispondi educatamente che sei specializzato solo in logistica europea. Rispondi sempre in italiano, con tono professionale ed esperto, in massimo 3 paragrafi.'

        const contents = [
          ...(history || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ]

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
              }),
            }
          )

          if (!geminiRes.ok) {
            const errText = await geminiRes.text()
            console.error('Gemini API error:', errText)
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Errore nella chiamata a Gemini' }))
            return
          }

          const data = await geminiRes.json()
          const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Mi dispiace, non sono riuscito a generare una risposta.'

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ response: text }))
        } catch (err) {
          console.error('Gemini chat error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Errore interno del server' }))
        }
      })

      // --- /api/predict → Railway ---
      server.middlewares.use('/api/predict', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(req.method === 'OPTIONS' ? 200 : 405, { 'Content-Type': 'application/json' })
          res.end(req.method === 'OPTIONS' ? '' : JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        if (!railwayUrl || !railwayKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'RAILWAY_API_URL/KEY not configured in .env' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = JSON.parse(Buffer.concat(chunks).toString())

        try {
          const railwayRes = await fetch(`${railwayUrl}/v1/predictions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': railwayKey,
            },
            body: JSON.stringify({ ...body, include_alternatives: false }),
          })

          if (!railwayRes.ok) {
            const errText = await railwayRes.text()
            console.error(`Railway API error [${railwayRes.status}]:`, errText)
            res.writeHead(railwayRes.status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `Errore Railway (${railwayRes.status})` }))
            return
          }

          const data = await railwayRes.json()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        } catch (err) {
          console.error('Railway proxy error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Errore interno del server' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
