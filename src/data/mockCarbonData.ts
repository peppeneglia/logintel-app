// ─── Types ───────────────────────────────────────

export interface RouteEmission {
  route: string
  distance: number
  co2Kg: number
  co2PerKm: number
  fuelLiters: number
  trips: number
  trend: 'up' | 'down' | 'stable'
}

export interface VehicleEmission {
  vehiclePlate: string
  model: string
  euroClass: string
  totalCo2Kg: number
  avgCo2PerKm: number
  trips: number
  totalKm: number
}

export interface CO2Optimization {
  id: string
  suggestion: string
  category: 'route' | 'vehicle' | 'driving' | 'fuel'
  potentialSavingKg: number
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'pending' | 'implemented' | 'dismissed'
}

export interface EmissionsMonthly {
  month: string
  co2Tons: number
  target: number
}

export interface ESGMetrics {
  totalEmissionsTons: number
  reductionPercent: number
  targetTons: number
  fleetEfficiency: number
  greenTripsPercent: number
}

// ─── Mock Route Emissions ────────────────────────

export const mockRouteEmissions: RouteEmission[] = [
  { route: 'Milano → Roma', distance: 580, co2Kg: 412, co2PerKm: 0.71, fuelLiters: 158, trips: 34, trend: 'down' },
  { route: 'Torino → Napoli', distance: 780, co2Kg: 589, co2PerKm: 0.76, fuelLiters: 226, trips: 18, trend: 'up' },
  { route: 'Bologna → Bari', distance: 620, co2Kg: 468, co2PerKm: 0.75, fuelLiters: 180, trips: 22, trend: 'stable' },
  { route: 'Genova → Venezia', distance: 400, co2Kg: 276, co2PerKm: 0.69, fuelLiters: 106, trips: 28, trend: 'down' },
  { route: 'Firenze → Palermo', distance: 950, co2Kg: 741, co2PerKm: 0.78, fuelLiters: 285, trips: 12, trend: 'up' },
  { route: 'Milano → Brennero', distance: 290, co2Kg: 232, co2PerKm: 0.80, fuelLiters: 89, trips: 42, trend: 'stable' },
  { route: 'Roma → Catania', distance: 690, co2Kg: 524, co2PerKm: 0.76, fuelLiters: 201, trips: 15, trend: 'down' },
  { route: 'Napoli → Bari', distance: 260, co2Kg: 175, co2PerKm: 0.67, fuelLiters: 67, trips: 38, trend: 'down' },
]

// ─── Mock Vehicle Emissions ──────────────────────

export const mockVehicleEmissions: VehicleEmission[] = [
  { vehiclePlate: 'FI 234 AB', model: 'Iveco Stralis', euroClass: 'Euro 6', totalCo2Kg: 4820, avgCo2PerKm: 0.72, trips: 48, totalKm: 6694 },
  { vehiclePlate: 'MI 567 CD', model: 'MAN TGX', euroClass: 'Euro 6', totalCo2Kg: 5130, avgCo2PerKm: 0.74, trips: 52, totalKm: 6932 },
  { vehiclePlate: 'TO 891 EF', model: 'Scania R450', euroClass: 'Euro 5', totalCo2Kg: 6240, avgCo2PerKm: 0.82, trips: 45, totalKm: 7610 },
  { vehiclePlate: 'NA 123 GH', model: 'Volvo FH', euroClass: 'Euro 6', totalCo2Kg: 4350, avgCo2PerKm: 0.70, trips: 40, totalKm: 6214 },
  { vehiclePlate: 'BO 456 IJ', model: 'DAF XF', euroClass: 'Euro 5', totalCo2Kg: 5890, avgCo2PerKm: 0.81, trips: 44, totalKm: 7272 },
  { vehiclePlate: 'GE 789 KL', model: 'Mercedes Actros', euroClass: 'Euro 6', totalCo2Kg: 4680, avgCo2PerKm: 0.71, trips: 50, totalKm: 6592 },
  { vehiclePlate: 'VE 012 MN', model: 'Renault T High', euroClass: 'Euro 4', totalCo2Kg: 7120, avgCo2PerKm: 0.89, trips: 42, totalKm: 8000 },
  { vehiclePlate: 'PA 345 OP', model: 'Iveco S-Way', euroClass: 'Euro 6', totalCo2Kg: 4150, avgCo2PerKm: 0.68, trips: 36, totalKm: 6103 },
]

// ─── Mock CO2 Optimizations ─────────────────────

export const mockCO2Optimizations: CO2Optimization[] = [
  { id: 'opt-01', suggestion: 'Consolidare spedizioni Milano-Roma del lunedi e mercoledi in un unico carico completo', category: 'route', potentialSavingKg: 320, difficulty: 'easy', status: 'pending' },
  { id: 'opt-02', suggestion: 'Sostituire veicolo VE 012 MN (Euro 4) con mezzo Euro 6 per la tratta Firenze-Palermo', category: 'vehicle', potentialSavingKg: 890, difficulty: 'hard', status: 'pending' },
  { id: 'opt-03', suggestion: 'Attivare eco-driving coaching per autisti con consumo sopra media flotta', category: 'driving', potentialSavingKg: 450, difficulty: 'medium', status: 'implemented' },
  { id: 'opt-04', suggestion: 'Passare a biodiesel HVO per tratte urbane Milano e Roma', category: 'fuel', potentialSavingKg: 1200, difficulty: 'hard', status: 'pending' },
  { id: 'opt-05', suggestion: 'Ottimizzare orari partenza Torino-Napoli per evitare traffico e ridurre consumi', category: 'route', potentialSavingKg: 180, difficulty: 'easy', status: 'implemented' },
  { id: 'opt-06', suggestion: 'Installare deflettori aerodinamici sui 4 veicoli senza kit completo', category: 'vehicle', potentialSavingKg: 560, difficulty: 'medium', status: 'pending' },
  { id: 'opt-07', suggestion: 'Ridurre velocita massima flotta da 90 a 85 km/h sulle autostrade', category: 'driving', potentialSavingKg: 380, difficulty: 'easy', status: 'dismissed' },
  { id: 'opt-08', suggestion: 'Utilizzare pneumatici a bassa resistenza al rotolamento classe A', category: 'vehicle', potentialSavingKg: 290, difficulty: 'medium', status: 'pending' },
]

// ─── Mock Emissions History ─────────────────────

export const mockEmissionsHistory: EmissionsMonthly[] = [
  { month: 'Set 2025', co2Tons: 14.8, target: 14.0 },
  { month: 'Ott 2025', co2Tons: 13.9, target: 13.5 },
  { month: 'Nov 2025', co2Tons: 13.2, target: 13.0 },
  { month: 'Dic 2025', co2Tons: 12.8, target: 12.5 },
  { month: 'Gen 2026', co2Tons: 12.1, target: 12.0 },
  { month: 'Feb 2026', co2Tons: 11.6, target: 11.5 },
]

// ─── Mock ESG Metrics ───────────────────────────

export const mockESGMetrics: ESGMetrics = {
  totalEmissionsTons: 78.4,
  reductionPercent: 12.3,
  targetTons: 70.0,
  fleetEfficiency: 0.74,
  greenTripsPercent: 34,
}
