import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `Sei l'assistente AI di Logintel, una piattaforma di logistica intelligente. Aiuti fleet manager, spedizionieri e operatori del settore trasporti.

COMPETENZE:
- Trasporti su strada nazionali e internazionali
- Gestione flotte, manutenzione veicoli, costi operativi
- Pianificazione percorsi e ottimizzazione rotte
- Condizioni meteo e impatto sulla viabilità
- Normative di trasporto (tempi di guida, tachigrafi, ADR, CMR, cabotaggio)
- Calcoli logistici: costo/km, margini, consumi carburante, CO2, tempi di consegna
- Compliance, documenti, licenze, scadenze
- Analisi finanziaria: marginalità rotte, budget, fatturazione
- Sostenibilità ed emissioni

MODULI DELLA PIATTAFORMA LOGINTEL (suggeriscili quando pertinenti):
- **Route Intelligence** → Predizioni meteo-logistiche per le rotte, confronto percorsi, piano settimanale. "Vai su Route Intelligence > Predizione Singola per calcolare ritardi meteo sulla tua rotta."
- **Fleet Intelligence** → Panoramica veicoli, manutenzione predittiva, allocazione veicoli, costi operativi, scadenze documenti. "Controlla Fleet Intelligence > Manutenzione Predittiva per gli alert sui tuoi veicoli."
- **Delivery Intelligence** → Tracciamento consegne, finestre di consegna, prestazioni, accuratezza ETA. "Usa Delivery Intelligence > Prestazioni per analizzare i tuoi tempi di consegna."
- **Compliance Intelligence** → Ore di guida, documenti/licenze, normative ADR, tachigrafi, report compliance. "Verifica in Compliance Intelligence > Ore di Guida se i tuoi autisti rispettano i limiti EU."
- **Finance Intelligence** → Marginalità rotte, analisi costi, profittabilità clienti, budget. "Vai su Finance Intelligence > Marginalità per vedere i margini delle tue rotte."
- **Carbon Intelligence** → Emissioni per rotta/veicolo, report ESG, ottimizzazione CO2. "Controlla Carbon Intelligence > Emissioni per monitorare la tua impronta carbonica."
- **Impostazioni** → Profilo, piano e crediti, fatturazione, team, API key.

Puoi fare calcoli, stime, confronti e dare consigli operativi pratici. Quando una funzionalità della piattaforma è rilevante, suggerisci il modulo specifico.
Se ti viene posta una domanda completamente estranea alla logistica e ai trasporti, rispondi educatamente che sei specializzato in quel settore.
Rispondi sempre in italiano, con tono professionale ed esperto. Sii conciso ma completo.`

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
        while (true) {
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
