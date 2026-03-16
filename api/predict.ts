import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiUrl = process.env.RAILWAY_API_URL
  const apiKey = process.env.RAILWAY_API_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'Railway API not configured' })
  }

  try {
    // Forza include_alternatives a false — il backend Railway ha un bug con le alternative
    const body = { ...req.body, include_alternatives: false }

    const response = await fetch(`${apiUrl}/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Railway API error [${response.status}]:`, errorData)
      return res.status(response.status).json({
        error: `Errore Railway (${response.status}): ${errorData}`,
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Predict API error:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}
