import { Router, Request, Response } from 'express'
import { predict, compareRoutes } from '../services/gemini'

const router = Router()

// POST /api/predict — Predizione singola
router.post('/', async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureTime, vehicleType } = req.body

    if (!origin || !destination || !departureTime) {
      res.status(400).json({ error: 'Campi obbligatori: origin, destination, departureTime' })
      return
    }

    const prediction = await predict({ origin, destination, departureTime, vehicleType })
    res.json(prediction)
  } catch (err) {
    console.error('Predict error:', err)
    res.status(500).json({ error: 'Errore nella generazione della predizione' })
  }
})

// POST /api/predict/compare — Confronto rotte
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureTime } = req.body

    if (!origin || !destination || !departureTime) {
      res.status(400).json({ error: 'Campi obbligatori: origin, destination, departureTime' })
      return
    }

    const routes = await compareRoutes(origin, destination, departureTime)
    res.json(routes)
  } catch (err) {
    console.error('Compare error:', err)
    res.status(500).json({ error: 'Errore nel confronto rotte' })
  }
})

// POST /api/predict/weekly — Piano settimanale
router.post('/weekly', async (req: Request, res: Response) => {
  try {
    const { routes } = req.body

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      res.status(400).json({ error: 'Campo obbligatorio: routes (array di rotte)' })
      return
    }

    // Genera predizioni in parallelo per ogni rotta
    const predictions = await Promise.all(
      routes.map(async (route: { origin: string; destination: string; dayOfWeek: string; departureTime: string }) => {
        const prediction = await predict({
          origin: route.origin,
          destination: route.destination,
          departureTime: route.departureTime,
          vehicleType: 'truck_standard',
        })
        return {
          ...route,
          prediction,
        }
      })
    )

    res.json(predictions)
  } catch (err) {
    console.error('Weekly predict error:', err)
    res.status(500).json({ error: 'Errore nella generazione del piano settimanale' })
  }
})

export default router
