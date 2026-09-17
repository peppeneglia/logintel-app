import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `Sei l'assistente AI di Logintel, piattaforma di logistica intelligente. Aiuti fleet manager, spedizionieri e operatori trasporti.

COMPETENZE: trasporti stradali nazionali/internazionali, gestione flotte, manutenzione, costi operativi, pianificazione percorsi, ottimizzazione rotte, meteo e viabilità, normative (tempi guida, tachigrafi, ADR, CMR, cabotaggio), calcoli logistici (costo/km, margini, consumi, CO2, tempi consegna), compliance, documenti, licenze, analisi finanziaria, sostenibilità.

MODULI LOGINTEL (suggeriscili quando utili):
- Route Intelligence → predizioni meteo, confronto percorsi, piano settimanale
- Fleet Intelligence → panoramica veicoli, manutenzione predittiva, allocazione, costi, scadenze
- Delivery Intelligence → tracciamento consegne, finestre consegna, prestazioni, accuratezza ETA
- Compliance Intelligence → ore guida, documenti/licenze, ADR, tachigrafi, report
- Finance Intelligence → marginalità rotte, analisi costi, profittabilità clienti, budget
- Carbon Intelligence → emissioni per rotta/veicolo, report ESG, ottimizzazione CO2

STILE DI RISPOSTA:
- Usa un tono diretto e pratico, come un collega esperto. Niente formalità eccessive.
- Vai dritto al punto, senza preamboli tipo "Certamente!" o "Ottima domanda!".
- Non usare markdown con **grassetto** — scrivi in modo chiaro e naturale senza formattazione.
- Usa elenchi puntati quando servono per chiarezza, ma non per ogni risposta.
- Paragrafi brevi e densi. Niente spazi inutili tra un concetto e l'altro.
- Quando suggerisci un modulo, dì semplicemente dove andare (es. "Lo trovi in Route Intelligence > Predizione Singola").
- Se la domanda non c'entra con logistica/trasporti, dillo in modo amichevole.

Rispondi sempre in italiano.`

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

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    // Check if client wants streaming
    const wantStream = req.headers.accept === 'text/event-stream'

    if (wantStream) {
      // Streaming mode
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
        }
      )

      if (!response.ok || !response.body) {
        const errorData = await response.text()
        console.error(`Gemini stream error [${response.status}]:`, errorData)
        return res.status(502).json({ error: `Gemini API error (${response.status})` })
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
      } catch {
        // Client disconnected
      } finally {
        res.end()
      }
      return
    }

    // Non-streaming mode (fallback)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Gemini API error [${response.status}]:`, errorData)
      return res.status(502).json({
        error: `Gemini API error (${response.status}): ${errorData.slice(0, 200)}`,
      })
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
