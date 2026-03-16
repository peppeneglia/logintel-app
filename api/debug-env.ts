import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const apiUrl = process.env.RAILWAY_API_URL || '(non impostata)'
  const apiKey = process.env.RAILWAY_API_KEY || '(non impostata)'

  res.status(200).json({
    RAILWAY_API_URL: apiUrl,
    RAILWAY_API_KEY_length: apiKey.length,
    RAILWAY_API_KEY_prefix: apiKey.substring(0, 6),
    RAILWAY_API_KEY_suffix: apiKey.substring(apiKey.length - 6),
    RAILWAY_API_KEY_has_spaces: apiKey !== apiKey.trim(),
    RAILWAY_API_KEY_has_quotes: apiKey.includes('"') || apiKey.includes("'"),
  })
}
