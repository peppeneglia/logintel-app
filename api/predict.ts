import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiUrl = process.env.RAILWAY_API_URL
  const apiKey = process.env.RAILWAY_API_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'Railway API not configured' })
  }

  try {
    const response = await fetch(`${apiUrl}/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Railway API error:', errorData)
      return res.status(response.status).json({ error: 'Errore nella predizione' })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Predict API error:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}
