// ─── Types ───────────────────────────────────────

export interface RouteMargin {
  id: string
  rotta: string
  ricavo: number
  costo: number
  margine: number
  marginePct: number
  km: number
}

export interface CostPerKm {
  id: string
  veicolo: string
  periodo: string
  carburante: number
  pedaggi: number
  manutenzione: number
  assicurazione: number
  totale: number
  costoPerKm: number
}

export interface ClientProfitability {
  id: string
  cliente: string
  tratte: number
  ricavoTotale: number
  costoTotale: number
  profitto: number
  marginePct: number
}

export interface PenaltyRecord {
  id: string
  tipo: 'subita' | 'evitata'
  cliente: string
  importo: number
  motivo: string
  data: string
}

export interface BudgetVsActual {
  id: string
  mese: string
  budget: number
  actual: number
  varianza: number
  varianzaPct: number
}

// ─── Mock Route Margins ─────────────────────────

export const mockRouteMargins: RouteMargin[] = [
  {
    id: 'rm-001',
    rotta: 'Milano - Roma',
    ricavo: 2850,
    costo: 1920,
    margine: 930,
    marginePct: 32.6,
    km: 575,
  },
  {
    id: 'rm-002',
    rotta: 'Torino - Napoli',
    ricavo: 3200,
    costo: 2480,
    margine: 720,
    marginePct: 22.5,
    km: 870,
  },
  {
    id: 'rm-003',
    rotta: 'Bologna - Bari',
    ricavo: 2100,
    costo: 1580,
    margine: 520,
    marginePct: 24.8,
    km: 680,
  },
  {
    id: 'rm-004',
    rotta: 'Genova - Firenze',
    ricavo: 1450,
    costo: 890,
    margine: 560,
    marginePct: 38.6,
    km: 310,
  },
  {
    id: 'rm-005',
    rotta: 'Verona - Palermo',
    ricavo: 4100,
    costo: 3520,
    margine: 580,
    marginePct: 14.1,
    km: 1250,
  },
  {
    id: 'rm-006',
    rotta: 'Milano - Venezia',
    ricavo: 1200,
    costo: 750,
    margine: 450,
    marginePct: 37.5,
    km: 270,
  },
  {
    id: 'rm-007',
    rotta: 'Roma - Catania',
    ricavo: 2800,
    costo: 2340,
    margine: 460,
    marginePct: 16.4,
    km: 830,
  },
  {
    id: 'rm-008',
    rotta: 'Firenze - Bologna',
    ricavo: 680,
    costo: 380,
    margine: 300,
    marginePct: 44.1,
    km: 110,
  },
]

// ─── Mock Cost Per Km ───────────────────────────

export const mockCostPerKm: CostPerKm[] = [
  {
    id: 'cpk-001',
    veicolo: 'FI 482 KT',
    periodo: 'Feb 2026',
    carburante: 1820,
    pedaggi: 430,
    manutenzione: 290,
    assicurazione: 180,
    totale: 2720,
    costoPerKm: 1.42,
  },
  {
    id: 'cpk-002',
    veicolo: 'MI 319 AB',
    periodo: 'Feb 2026',
    carburante: 2150,
    pedaggi: 510,
    manutenzione: 150,
    assicurazione: 195,
    totale: 3005,
    costoPerKm: 1.38,
  },
  {
    id: 'cpk-003',
    veicolo: 'RM 751 GH',
    periodo: 'Feb 2026',
    carburante: 1640,
    pedaggi: 380,
    manutenzione: 620,
    assicurazione: 210,
    totale: 2850,
    costoPerKm: 1.65,
  },
  {
    id: 'cpk-004',
    veicolo: 'TO 628 PL',
    periodo: 'Feb 2026',
    carburante: 1980,
    pedaggi: 470,
    manutenzione: 180,
    assicurazione: 175,
    totale: 2805,
    costoPerKm: 1.35,
  },
  {
    id: 'cpk-005',
    veicolo: 'NA 504 RZ',
    periodo: 'Feb 2026',
    carburante: 2310,
    pedaggi: 560,
    manutenzione: 420,
    assicurazione: 200,
    totale: 3490,
    costoPerKm: 1.58,
  },
  {
    id: 'cpk-006',
    veicolo: 'BO 913 VN',
    periodo: 'Feb 2026',
    carburante: 1550,
    pedaggi: 340,
    manutenzione: 130,
    assicurazione: 185,
    totale: 2205,
    costoPerKm: 1.28,
  },
]

// ─── Mock Client Profitability ──────────────────

export const mockClientProfitability: ClientProfitability[] = [
  {
    id: 'cp-001',
    cliente: 'Ferrero S.p.A.',
    tratte: 42,
    ricavoTotale: 68500,
    costoTotale: 48200,
    profitto: 20300,
    marginePct: 29.6,
  },
  {
    id: 'cp-002',
    cliente: 'Barilla Group',
    tratte: 38,
    ricavoTotale: 52400,
    costoTotale: 38100,
    profitto: 14300,
    marginePct: 27.3,
  },
  {
    id: 'cp-003',
    cliente: 'Esselunga S.p.A.',
    tratte: 65,
    ricavoTotale: 91200,
    costoTotale: 71800,
    profitto: 19400,
    marginePct: 21.3,
  },
  {
    id: 'cp-004',
    cliente: 'COOP Italia',
    tratte: 51,
    ricavoTotale: 73800,
    costoTotale: 52400,
    profitto: 21400,
    marginePct: 29.0,
  },
  {
    id: 'cp-005',
    cliente: 'Luxottica S.r.l.',
    tratte: 28,
    ricavoTotale: 45600,
    costoTotale: 36900,
    profitto: 8700,
    marginePct: 19.1,
  },
  {
    id: 'cp-006',
    cliente: 'Lavazza S.p.A.',
    tratte: 33,
    ricavoTotale: 41200,
    costoTotale: 27800,
    profitto: 13400,
    marginePct: 32.5,
  },
  {
    id: 'cp-007',
    cliente: 'Prada S.p.A.',
    tratte: 18,
    ricavoTotale: 38900,
    costoTotale: 24100,
    profitto: 14800,
    marginePct: 38.0,
  },
  {
    id: 'cp-008',
    cliente: 'Conad',
    tratte: 47,
    ricavoTotale: 58300,
    costoTotale: 49200,
    profitto: 9100,
    marginePct: 15.6,
  },
]

// ─── Mock Penalty Records ───────────────────────

export const mockPenaltyRecords: PenaltyRecord[] = [
  {
    id: 'pen-001',
    tipo: 'subita',
    cliente: 'Esselunga S.p.A.',
    importo: 1500,
    motivo: 'Ritardo consegna > 2h',
    data: '2026-02-20',
  },
  {
    id: 'pen-002',
    tipo: 'evitata',
    cliente: 'Ferrero S.p.A.',
    importo: 800,
    motivo: 'Consegna riallocata in tempo',
    data: '2026-02-19',
  },
  {
    id: 'pen-003',
    tipo: 'subita',
    cliente: 'COOP Italia',
    importo: 2200,
    motivo: 'Merce danneggiata in transito',
    data: '2026-02-18',
  },
  {
    id: 'pen-004',
    tipo: 'evitata',
    cliente: 'Barilla Group',
    importo: 1200,
    motivo: 'Rotta alternativa per chiusura autostradale',
    data: '2026-02-17',
  },
  {
    id: 'pen-005',
    tipo: 'subita',
    cliente: 'Conad',
    importo: 950,
    motivo: 'Documentazione incompleta',
    data: '2026-02-15',
  },
  {
    id: 'pen-006',
    tipo: 'evitata',
    cliente: 'Luxottica S.r.l.',
    importo: 3000,
    motivo: 'Risoluzione proattiva anomalia temperatura',
    data: '2026-02-14',
  },
  {
    id: 'pen-007',
    tipo: 'subita',
    cliente: 'Lavazza S.p.A.',
    importo: 600,
    motivo: 'Ritardo consegna < 2h',
    data: '2026-02-12',
  },
  {
    id: 'pen-008',
    tipo: 'evitata',
    cliente: 'Prada S.p.A.',
    importo: 1800,
    motivo: 'Veicolo sostitutivo inviato tempestivamente',
    data: '2026-02-10',
  },
]

// ─── Mock Budget vs Actual ──────────────────────

export const mockBudgetVsActual: BudgetVsActual[] = [
  {
    id: 'bva-001',
    mese: 'Set 2025',
    budget: 185000,
    actual: 178500,
    varianza: -6500,
    varianzaPct: -3.5,
  },
  {
    id: 'bva-002',
    mese: 'Ott 2025',
    budget: 192000,
    actual: 198400,
    varianza: 6400,
    varianzaPct: 3.3,
  },
  {
    id: 'bva-003',
    mese: 'Nov 2025',
    budget: 188000,
    actual: 191200,
    varianza: 3200,
    varianzaPct: 1.7,
  },
  {
    id: 'bva-004',
    mese: 'Dic 2025',
    budget: 210000,
    actual: 225800,
    varianza: 15800,
    varianzaPct: 7.5,
  },
  {
    id: 'bva-005',
    mese: 'Gen 2026',
    budget: 195000,
    actual: 189300,
    varianza: -5700,
    varianzaPct: -2.9,
  },
  {
    id: 'bva-006',
    mese: 'Feb 2026',
    budget: 198000,
    actual: 202100,
    varianza: 4100,
    varianzaPct: 2.1,
  },
]
