import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const CHAT_SYSTEM_PROMPT = `Sei un assistente AI specializzato in logistica stradale europea.
Rispondi SOLO a domande su: trasporti, rotte, flotte, meteo lungo le tratte, normativa trasporti, ETA, consegne.
Rispondi in italiano, in modo conciso (massimo 3 paragrafi).
Se la domanda non riguarda la logistica, rispondi cortesemente che puoi aiutare solo con temi di logistica.`

const PREDICTION_SYSTEM_PROMPT = `Sei un sistema AI di predizione per la logistica stradale italiana ed europea.
Ti verrà fornita una rotta con origine, destinazione, orario di partenza e tipo di veicolo.

Devi generare una predizione REALISTICA basata sulla tua conoscenza di:
- Condizioni stradali tipiche lungo il percorso
- Meteo stagionale della zona e del periodo
- Traffico tipico per giorno della settimana e orario
- Caratteristiche del tipo di veicolo

IMPORTANTE: Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backtick.

Il JSON deve avere questa struttura esatta:
{
  "estimatedDelay": <numero minuti di ritardo stimato, intero>,
  "confidence": <percentuale 0-100, intero>,
  "weatherConditions": [
    {
      "km": <chilometro lungo il percorso>,
      "location": "<nome città/località>",
      "condition": "<clear|rain_light|rain_heavy|snow|fog|wind|storm>",
      "impactMinutes": <minuti di impatto sulla rotta>,
      "temperature": <temperatura in celsius>
    }
  ],
  "alternativeRoute": {
    "name": "<nome percorso alternativo>",
    "estimatedDelay": <minuti di ritardo>,
    "savings": <minuti risparmiati rispetto alla rotta principale>,
    "distance": <distanza in km>
  },
  "totalDistanceKm": <distanza totale in km>,
  "baseDurationMinutes": <durata base senza ritardi in minuti>
}

Genera 3-6 punti meteo lungo il percorso. L'alternativeRoute è opzionale (includila solo se il ritardo è > 15 minuti).`

const COMPARE_SYSTEM_PROMPT = `Sei un sistema AI di confronto rotte per la logistica stradale.
Ti verrà fornita origine, destinazione e orario di partenza.

Devi generare 3 rotte alternative REALISTICHE con nomi reali di autostrade/strade italiane.

IMPORTANTE: Rispondi SOLO con un array JSON valido, senza testo aggiuntivo, senza markdown, senza backtick.

Ogni elemento deve avere questa struttura:
{
  "name": "<nome rotta, es: Via A1 Autosole>",
  "distance": <distanza in km>,
  "baseDuration": <durata base in minuti>,
  "weatherDelay": <ritardo meteo in minuti>,
  "risk": "<low|medium|high>",
  "eta": "<HH:mm>",
  "recommended": <true per la rotta migliore, false per le altre>
}

Solo una rotta deve avere "recommended": true.`

export async function chat(message: string, history: { role: string; content: string }[]): Promise<string> {
  const chatSession = model.startChat({
    history: [
      { role: 'user', parts: [{ text: CHAT_SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Capito. Sono pronto ad aiutarti con la logistica stradale.' }] },
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user' as const,
        parts: [{ text: m.content }],
      })),
    ],
  })

  const result = await chatSession.sendMessage(message)
  return result.response.text()
}

export interface PredictInput {
  origin: string
  destination: string
  departureTime: string
  vehicleType?: string
}

export async function predict(input: PredictInput) {
  const prompt = `Genera una predizione per questa rotta:
- Origine: ${input.origin}
- Destinazione: ${input.destination}
- Partenza: ${input.departureTime}
- Tipo veicolo: ${input.vehicleType || 'truck_standard'}

Considera la data e l'orario per stimare traffico e meteo realistici.`

  const result = await model.generateContent([PREDICTION_SYSTEM_PROMPT, prompt])
  const text = result.response.text().trim()

  try {
    return JSON.parse(text)
  } catch {
    // Prova a estrarre JSON dal testo
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Risposta AI non valida')
  }
}

export async function compareRoutes(origin: string, destination: string, departureTime: string) {
  const prompt = `Confronta le rotte possibili:
- Origine: ${origin}
- Destinazione: ${destination}
- Partenza: ${departureTime}

Genera 3 rotte alternative realistiche con autostrade/strade italiane reali.`

  const result = await model.generateContent([COMPARE_SYSTEM_PROMPT, prompt])
  const text = result.response.text().trim()

  try {
    return JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Risposta AI non valida')
  }
}
