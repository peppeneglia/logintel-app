// ─── Fleet Intelligence Types ────────────────────

export interface FleetVehicle {
  id: string
  plate: string
  model: string
  type: string
  status: 'active' | 'maintenance' | 'inactive'
  mileage: number
  driver: string
  fuelLevel: number
  lastMaintenance: string
  nextMaintenance: string
}

export interface MaintenanceAlert {
  id: string
  vehiclePlate: string
  component: string
  risk: 'low' | 'medium' | 'high'
  predictedDate: string
  mileageToFailure: number
  status: 'pending' | 'scheduled' | 'resolved'
}

export interface VehicleAllocation {
  id: string
  vehiclePlate: string
  route: string
  driver: string
  departureDate: string
  status: 'scheduled' | 'in_transit' | 'completed'
}

export interface OperationalCost {
  vehiclePlate: string
  period: string
  fuelCost: number
  maintenanceCost: number
  tollCost: number
  insuranceCost: number
  totalCost: number
  costPerKm: number
  km: number
}

export interface DocumentExpiry {
  id: string
  holder: string
  holderType: 'vehicle' | 'driver'
  documentType: string
  expiryDate: string
  status: 'valid' | 'expiring' | 'expired'
  daysLeft: number
}

// ─── Mock Fleet Vehicles ─────────────────────────

export const mockFleetVehicles: FleetVehicle[] = [
  {
    id: 'v-001',
    plate: 'FI 234 AB',
    model: 'Iveco Daily 35S16',
    type: 'Furgone',
    status: 'active',
    mileage: 87420,
    driver: 'Marco Bianchi',
    fuelLevel: 72,
    lastMaintenance: '2026-01-15',
    nextMaintenance: '2026-04-15',
  },
  {
    id: 'v-002',
    plate: 'MI 567 CD',
    model: 'MAN TGX 18.510',
    type: 'Motrice',
    status: 'active',
    mileage: 234100,
    driver: 'Luca Rossi',
    fuelLevel: 45,
    lastMaintenance: '2026-01-28',
    nextMaintenance: '2026-04-28',
  },
  {
    id: 'v-003',
    plate: 'RM 891 EF',
    model: 'Mercedes Actros 1845',
    type: 'Motrice',
    status: 'maintenance',
    mileage: 312500,
    driver: 'Paolo Verdi',
    fuelLevel: 18,
    lastMaintenance: '2026-02-10',
    nextMaintenance: '2026-05-10',
  },
  {
    id: 'v-004',
    plate: 'TO 123 GH',
    model: 'Iveco S-Way 490',
    type: 'Trattore',
    status: 'active',
    mileage: 156800,
    driver: 'Andrea Colombo',
    fuelLevel: 88,
    lastMaintenance: '2026-02-01',
    nextMaintenance: '2026-05-01',
  },
  {
    id: 'v-005',
    plate: 'NA 456 IJ',
    model: 'Scania R 450',
    type: 'Motrice',
    status: 'active',
    mileage: 198300,
    driver: 'Giuseppe Esposito',
    fuelLevel: 61,
    lastMaintenance: '2025-12-20',
    nextMaintenance: '2026-03-20',
  },
  {
    id: 'v-006',
    plate: 'BO 789 KL',
    model: 'DAF XF 480',
    type: 'Trattore',
    status: 'inactive',
    mileage: 421000,
    driver: 'Davide Ricci',
    fuelLevel: 5,
    lastMaintenance: '2025-11-05',
    nextMaintenance: '2026-02-05',
  },
  {
    id: 'v-007',
    plate: 'GE 012 MN',
    model: 'Iveco Eurocargo 120E25',
    type: 'Furgone',
    status: 'active',
    mileage: 64200,
    driver: 'Stefano Marino',
    fuelLevel: 93,
    lastMaintenance: '2026-02-18',
    nextMaintenance: '2026-05-18',
  },
  {
    id: 'v-008',
    plate: 'VE 345 OP',
    model: 'Volvo FH 500',
    type: 'Motrice',
    status: 'active',
    mileage: 278900,
    driver: 'Roberto Gallo',
    fuelLevel: 34,
    lastMaintenance: '2026-01-10',
    nextMaintenance: '2026-04-10',
  },
]

// ─── Mock Maintenance Alerts ─────────────────────

export const mockMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: 'ma-001',
    vehiclePlate: 'MI 567 CD',
    component: 'Pastiglie freno anteriori',
    risk: 'high',
    predictedDate: '2026-03-05',
    mileageToFailure: 4200,
    status: 'pending',
  },
  {
    id: 'ma-002',
    vehiclePlate: 'RM 891 EF',
    component: 'Cinghia distribuzione',
    risk: 'high',
    predictedDate: '2026-03-01',
    mileageToFailure: 1800,
    status: 'scheduled',
  },
  {
    id: 'ma-003',
    vehiclePlate: 'NA 456 IJ',
    component: 'Filtro olio motore',
    risk: 'medium',
    predictedDate: '2026-03-18',
    mileageToFailure: 8500,
    status: 'pending',
  },
  {
    id: 'ma-004',
    vehiclePlate: 'VE 345 OP',
    component: 'Ammortizzatori posteriori',
    risk: 'medium',
    predictedDate: '2026-04-02',
    mileageToFailure: 12300,
    status: 'pending',
  },
  {
    id: 'ma-005',
    vehiclePlate: 'FI 234 AB',
    component: 'Batteria avviamento',
    risk: 'low',
    predictedDate: '2026-05-10',
    mileageToFailure: 22000,
    status: 'resolved',
  },
  {
    id: 'ma-006',
    vehiclePlate: 'TO 123 GH',
    component: 'Liquido refrigerante',
    risk: 'low',
    predictedDate: '2026-04-20',
    mileageToFailure: 15600,
    status: 'pending',
  },
  {
    id: 'ma-007',
    vehiclePlate: 'BO 789 KL',
    component: 'Turbocompressore',
    risk: 'high',
    predictedDate: '2026-02-28',
    mileageToFailure: 800,
    status: 'scheduled',
  },
  {
    id: 'ma-008',
    vehiclePlate: 'GE 012 MN',
    component: 'Pneumatici asse anteriore',
    risk: 'medium',
    predictedDate: '2026-03-25',
    mileageToFailure: 9800,
    status: 'pending',
  },
]

// ─── Mock Vehicle Allocations ────────────────────

export const mockVehicleAllocations: VehicleAllocation[] = [
  {
    id: 'va-001',
    vehiclePlate: 'FI 234 AB',
    route: 'Firenze - Roma',
    driver: 'Marco Bianchi',
    departureDate: '2026-02-26T06:00',
    status: 'scheduled',
  },
  {
    id: 'va-002',
    vehiclePlate: 'MI 567 CD',
    route: 'Milano - Napoli',
    driver: 'Luca Rossi',
    departureDate: '2026-02-25T05:30',
    status: 'in_transit',
  },
  {
    id: 'va-003',
    vehiclePlate: 'TO 123 GH',
    route: 'Torino - Genova',
    driver: 'Andrea Colombo',
    departureDate: '2026-02-25T07:00',
    status: 'in_transit',
  },
  {
    id: 'va-004',
    vehiclePlate: 'NA 456 IJ',
    route: 'Napoli - Bari',
    driver: 'Giuseppe Esposito',
    departureDate: '2026-02-24T08:00',
    status: 'completed',
  },
  {
    id: 'va-005',
    vehiclePlate: 'GE 012 MN',
    route: 'Genova - Milano',
    driver: 'Stefano Marino',
    departureDate: '2026-02-26T09:00',
    status: 'scheduled',
  },
  {
    id: 'va-006',
    vehiclePlate: 'VE 345 OP',
    route: 'Venezia - Bologna',
    driver: 'Roberto Gallo',
    departureDate: '2026-02-25T04:30',
    status: 'in_transit',
  },
  {
    id: 'va-007',
    vehiclePlate: 'FI 234 AB',
    route: 'Roma - Firenze',
    driver: 'Marco Bianchi',
    departureDate: '2026-02-23T14:00',
    status: 'completed',
  },
]

// ─── Mock Operational Costs ──────────────────────

export const mockOperationalCosts: OperationalCost[] = [
  {
    vehiclePlate: 'FI 234 AB',
    period: 'Feb 2026',
    fuelCost: 1280,
    maintenanceCost: 320,
    tollCost: 410,
    insuranceCost: 185,
    totalCost: 2195,
    costPerKm: 0.58,
    km: 3784,
  },
  {
    vehiclePlate: 'MI 567 CD',
    period: 'Feb 2026',
    fuelCost: 2450,
    maintenanceCost: 580,
    tollCost: 720,
    insuranceCost: 210,
    totalCost: 3960,
    costPerKm: 0.52,
    km: 7615,
  },
  {
    vehiclePlate: 'RM 891 EF',
    period: 'Feb 2026',
    fuelCost: 890,
    maintenanceCost: 1450,
    tollCost: 280,
    insuranceCost: 210,
    totalCost: 2830,
    costPerKm: 0.71,
    km: 3986,
  },
  {
    vehiclePlate: 'TO 123 GH',
    period: 'Feb 2026',
    fuelCost: 1980,
    maintenanceCost: 250,
    tollCost: 560,
    insuranceCost: 195,
    totalCost: 2985,
    costPerKm: 0.49,
    km: 6092,
  },
  {
    vehiclePlate: 'NA 456 IJ',
    period: 'Feb 2026',
    fuelCost: 2100,
    maintenanceCost: 410,
    tollCost: 650,
    insuranceCost: 210,
    totalCost: 3370,
    costPerKm: 0.54,
    km: 6241,
  },
  {
    vehiclePlate: 'BO 789 KL',
    period: 'Feb 2026',
    fuelCost: 320,
    maintenanceCost: 2100,
    tollCost: 0,
    insuranceCost: 210,
    totalCost: 2630,
    costPerKm: 1.84,
    km: 1430,
  },
  {
    vehiclePlate: 'GE 012 MN',
    period: 'Feb 2026',
    fuelCost: 960,
    maintenanceCost: 180,
    tollCost: 310,
    insuranceCost: 175,
    totalCost: 1625,
    costPerKm: 0.51,
    km: 3186,
  },
  {
    vehiclePlate: 'VE 345 OP',
    period: 'Feb 2026',
    fuelCost: 2280,
    maintenanceCost: 390,
    tollCost: 680,
    insuranceCost: 210,
    totalCost: 3560,
    costPerKm: 0.53,
    km: 6717,
  },
]

// ─── Mock Document Expiries ──────────────────────

export const mockDocumentExpiries: DocumentExpiry[] = [
  {
    id: 'de-001',
    holder: 'BO 789 KL',
    holderType: 'vehicle',
    documentType: 'Revisione',
    expiryDate: '2026-02-28',
    status: 'expired',
    daysLeft: -3,
  },
  {
    id: 'de-002',
    holder: 'Davide Ricci',
    holderType: 'driver',
    documentType: 'Patente CQC',
    expiryDate: '2026-03-05',
    status: 'expiring',
    daysLeft: 8,
  },
  {
    id: 'de-003',
    holder: 'RM 891 EF',
    holderType: 'vehicle',
    documentType: 'Assicurazione RCA',
    expiryDate: '2026-03-10',
    status: 'expiring',
    daysLeft: 13,
  },
  {
    id: 'de-004',
    holder: 'Paolo Verdi',
    holderType: 'driver',
    documentType: 'Carta tachigrafica',
    expiryDate: '2026-03-15',
    status: 'expiring',
    daysLeft: 18,
  },
  {
    id: 'de-005',
    holder: 'NA 456 IJ',
    holderType: 'vehicle',
    documentType: 'Revisione',
    expiryDate: '2026-06-20',
    status: 'valid',
    daysLeft: 115,
  },
  {
    id: 'de-006',
    holder: 'Marco Bianchi',
    holderType: 'driver',
    documentType: 'Patente C',
    expiryDate: '2027-01-12',
    status: 'valid',
    daysLeft: 321,
  },
  {
    id: 'de-007',
    holder: 'FI 234 AB',
    holderType: 'vehicle',
    documentType: 'Assicurazione RCA',
    expiryDate: '2026-08-01',
    status: 'valid',
    daysLeft: 156,
  },
  {
    id: 'de-008',
    holder: 'MI 567 CD',
    holderType: 'vehicle',
    documentType: 'Autorizzazione conto terzi',
    expiryDate: '2026-03-02',
    status: 'expiring',
    daysLeft: 5,
  },
]
