// ─── Types ──────────────────────────────────────────

export interface DeliveryRecord {
  id: string
  client: string
  origin: string
  destination: string
  scheduledDelivery: string
  actualDelivery?: string
  status: 'on_time' | 'late' | 'early' | 'in_transit' | 'pending'
  delayMinutes?: number
  driver: string
  vehiclePlate: string
}

export interface ActiveTracking {
  id: string
  vehiclePlate: string
  driver: string
  origin: string
  destination: string
  currentLocation: string
  progressPercent: number
  eta: string
  status: 'on_schedule' | 'delayed' | 'ahead'
}

export interface DeliveryWindow {
  id: string
  client: string
  address: string
  windowStart: string
  windowEnd: string
  estimatedArrival: string
  status: 'confirmed' | 'at_risk' | 'missed'
  vehiclePlate: string
}

export interface CustomerNotification {
  id: string
  client: string
  type: 'eta_update' | 'delay_alert' | 'delivered' | 'departure'
  message: string
  sentAt: string
  channel: 'email' | 'sms' | 'webhook'
}

export interface ETAAccuracyRecord {
  route: string
  totalPredictions: number
  avgErrorMinutes: number
  accuracyPercent: number
  within5min: number
  within15min: number
}

// ─── Mock Deliveries ────────────────────────────────

export const mockDeliveries: DeliveryRecord[] = [
  {
    id: 'del-001',
    client: 'Ferrero S.p.A.',
    origin: 'Torino',
    destination: 'Milano',
    scheduledDelivery: '2026-02-25 09:00',
    actualDelivery: '2026-02-25 08:52',
    status: 'early',
    delayMinutes: -8,
    driver: 'Marco Bianchi',
    vehiclePlate: 'FI 234 AB',
  },
  {
    id: 'del-002',
    client: 'Barilla G. e R. Fratelli',
    origin: 'Parma',
    destination: 'Roma',
    scheduledDelivery: '2026-02-25 14:00',
    actualDelivery: '2026-02-25 14:03',
    status: 'on_time',
    delayMinutes: 3,
    driver: 'Luca Rossi',
    vehiclePlate: 'MI 789 CD',
  },
  {
    id: 'del-003',
    client: 'Luxottica Group',
    origin: 'Belluno',
    destination: 'Napoli',
    scheduledDelivery: '2026-02-25 11:30',
    actualDelivery: '2026-02-25 12:47',
    status: 'late',
    delayMinutes: 77,
    driver: 'Giovanni Esposito',
    vehiclePlate: 'BO 456 EF',
  },
  {
    id: 'del-004',
    client: 'Eataly S.r.l.',
    origin: 'Bologna',
    destination: 'Firenze',
    scheduledDelivery: '2026-02-25 16:00',
    status: 'in_transit',
    driver: 'Alessandro Conti',
    vehiclePlate: 'TO 321 GH',
  },
  {
    id: 'del-005',
    client: 'Prada S.p.A.',
    origin: 'Milano',
    destination: 'Venezia',
    scheduledDelivery: '2026-02-26 08:00',
    status: 'pending',
    driver: 'Stefano Ricci',
    vehiclePlate: 'RM 654 IJ',
  },
  {
    id: 'del-006',
    client: 'Benetton Group',
    origin: 'Treviso',
    destination: 'Genova',
    scheduledDelivery: '2026-02-25 10:00',
    actualDelivery: '2026-02-25 10:22',
    status: 'late',
    delayMinutes: 22,
    driver: 'Andrea Moretti',
    vehiclePlate: 'NA 987 KL',
  },
  {
    id: 'del-007',
    client: 'Lavazza S.p.A.',
    origin: 'Torino',
    destination: 'Bari',
    scheduledDelivery: '2026-02-25 13:00',
    actualDelivery: '2026-02-25 12:55',
    status: 'on_time',
    delayMinutes: -5,
    driver: 'Paolo Ferrara',
    vehiclePlate: 'GE 112 MN',
  },
  {
    id: 'del-008',
    client: 'Campari Group',
    origin: 'Milano',
    destination: 'Palermo',
    scheduledDelivery: '2026-02-25 18:00',
    status: 'in_transit',
    driver: 'Davide Romano',
    vehiclePlate: 'VE 445 OP',
  },
]

// ─── Mock Active Trackings ──────────────────────────

export const mockActiveTrackings: ActiveTracking[] = [
  {
    id: 'track-001',
    vehiclePlate: 'TO 321 GH',
    driver: 'Alessandro Conti',
    origin: 'Bologna',
    destination: 'Firenze',
    currentLocation: 'Prato Nord',
    progressPercent: 78,
    eta: '15:42',
    status: 'on_schedule',
  },
  {
    id: 'track-002',
    vehiclePlate: 'VE 445 OP',
    driver: 'Davide Romano',
    origin: 'Milano',
    destination: 'Palermo',
    currentLocation: 'Salerno (A3)',
    progressPercent: 52,
    eta: '18:35',
    status: 'delayed',
  },
  {
    id: 'track-003',
    vehiclePlate: 'FI 234 AB',
    driver: 'Marco Bianchi',
    origin: 'Milano',
    destination: 'Torino',
    currentLocation: 'Novara Est',
    progressPercent: 65,
    eta: '17:10',
    status: 'ahead',
  },
  {
    id: 'track-004',
    vehiclePlate: 'MI 789 CD',
    driver: 'Luca Rossi',
    origin: 'Roma',
    destination: 'Napoli',
    currentLocation: 'Cassino (A1)',
    progressPercent: 41,
    eta: '19:05',
    status: 'on_schedule',
  },
  {
    id: 'track-005',
    vehiclePlate: 'NA 987 KL',
    driver: 'Andrea Moretti',
    origin: 'Genova',
    destination: 'Bologna',
    currentLocation: 'Parma Ovest (A15)',
    progressPercent: 58,
    eta: '18:20',
    status: 'delayed',
  },
]

// ─── Mock Delivery Windows ──────────────────────────

export const mockDeliveryWindows: DeliveryWindow[] = [
  {
    id: 'win-001',
    client: 'Ferrero S.p.A.',
    address: 'Via Salaria 1322, Roma',
    windowStart: '08:00',
    windowEnd: '10:00',
    estimatedArrival: '09:15',
    status: 'confirmed',
    vehiclePlate: 'FI 234 AB',
  },
  {
    id: 'win-002',
    client: 'Barilla G. e R. Fratelli',
    address: 'Via Mantova 166, Parma',
    windowStart: '10:00',
    windowEnd: '12:00',
    estimatedArrival: '11:50',
    status: 'at_risk',
    vehiclePlate: 'MI 789 CD',
  },
  {
    id: 'win-003',
    client: 'Luxottica Group',
    address: 'Piazzale Cadorna 3, Milano',
    windowStart: '14:00',
    windowEnd: '16:00',
    estimatedArrival: '15:10',
    status: 'confirmed',
    vehiclePlate: 'BO 456 EF',
  },
  {
    id: 'win-004',
    client: 'Eataly S.r.l.',
    address: 'Via Nizza 230, Torino',
    windowStart: '09:00',
    windowEnd: '11:00',
    estimatedArrival: '11:25',
    status: 'missed',
    vehiclePlate: 'TO 321 GH',
  },
  {
    id: 'win-005',
    client: 'Prada S.p.A.',
    address: 'Via Fogazzaro 36, Arezzo',
    windowStart: '13:00',
    windowEnd: '15:00',
    estimatedArrival: '13:40',
    status: 'confirmed',
    vehiclePlate: 'RM 654 IJ',
  },
  {
    id: 'win-006',
    client: 'Campari Group',
    address: 'Via Sacchetti 20, Sesto San Giovanni',
    windowStart: '07:00',
    windowEnd: '09:00',
    estimatedArrival: '08:55',
    status: 'at_risk',
    vehiclePlate: 'VE 445 OP',
  },
  {
    id: 'win-007',
    client: 'Lavazza S.p.A.',
    address: 'Corso Novara 59, Torino',
    windowStart: '15:00',
    windowEnd: '17:00',
    estimatedArrival: '15:35',
    status: 'confirmed',
    vehiclePlate: 'GE 112 MN',
  },
]

// ─── Mock Customer Notifications ────────────────────

export const mockCustomerNotifications: CustomerNotification[] = [
  {
    id: 'notif-001',
    client: 'Ferrero S.p.A.',
    type: 'departure',
    message: 'Il veicolo FI 234 AB e\u0300 partito da Torino alle 06:30. Arrivo previsto entro le 09:00.',
    sentAt: '2026-02-25 06:32',
    channel: 'email',
  },
  {
    id: 'notif-002',
    client: 'Barilla G. e R. Fratelli',
    type: 'eta_update',
    message: 'Aggiornamento ETA: il veicolo MI 789 CD arrivera\u0300 alle 11:50 invece delle 11:30 previste.',
    sentAt: '2026-02-25 09:45',
    channel: 'webhook',
  },
  {
    id: 'notif-003',
    client: 'Luxottica Group',
    type: 'delay_alert',
    message: 'Attenzione: ritardo di 77 minuti sulla consegna del veicolo BO 456 EF causa traffico intenso in A14.',
    sentAt: '2026-02-25 10:15',
    channel: 'sms',
  },
  {
    id: 'notif-004',
    client: 'Eataly S.r.l.',
    type: 'delivered',
    message: 'Consegna completata. Il veicolo TO 321 GH ha consegnato presso Via Nizza 230, Torino alle 15:42.',
    sentAt: '2026-02-25 15:43',
    channel: 'email',
  },
  {
    id: 'notif-005',
    client: 'Prada S.p.A.',
    type: 'departure',
    message: 'Il veicolo RM 654 IJ partira\u0300 da Milano domani alle 08:00. Consegna prevista entro le 13:00.',
    sentAt: '2026-02-25 17:00',
    channel: 'email',
  },
  {
    id: 'notif-006',
    client: 'Campari Group',
    type: 'delay_alert',
    message: 'Attenzione: il veicolo VE 445 OP registra un ritardo di circa 35 minuti. Nuovo arrivo stimato: 18:35.',
    sentAt: '2026-02-25 14:20',
    channel: 'sms',
  },
  {
    id: 'notif-007',
    client: 'Lavazza S.p.A.',
    type: 'delivered',
    message: 'Consegna completata con 5 minuti di anticipo. Veicolo GE 112 MN, Bari.',
    sentAt: '2026-02-25 12:55',
    channel: 'webhook',
  },
  {
    id: 'notif-008',
    client: 'Benetton Group',
    type: 'eta_update',
    message: 'Aggiornamento: il veicolo NA 987 KL e\u0300 in ritardo di 22 minuti. Nuovo arrivo stimato: 10:22.',
    sentAt: '2026-02-25 09:10',
    channel: 'email',
  },
]

// ─── Mock ETA Accuracy ──────────────────────────────

export const mockETAAccuracy: ETAAccuracyRecord[] = [
  {
    route: 'Milano \u2192 Roma',
    totalPredictions: 142,
    avgErrorMinutes: 6.2,
    accuracyPercent: 87,
    within5min: 62,
    within15min: 91,
  },
  {
    route: 'Torino \u2192 Napoli',
    totalPredictions: 98,
    avgErrorMinutes: 8.5,
    accuracyPercent: 82,
    within5min: 51,
    within15min: 85,
  },
  {
    route: 'Bologna \u2192 Firenze',
    totalPredictions: 210,
    avgErrorMinutes: 3.1,
    accuracyPercent: 94,
    within5min: 79,
    within15min: 97,
  },
  {
    route: 'Genova \u2192 Venezia',
    totalPredictions: 76,
    avgErrorMinutes: 11.3,
    accuracyPercent: 74,
    within5min: 38,
    within15min: 72,
  },
  {
    route: 'Roma \u2192 Bari',
    totalPredictions: 124,
    avgErrorMinutes: 5.8,
    accuracyPercent: 89,
    within5min: 64,
    within15min: 93,
  },
  {
    route: 'Milano \u2192 Palermo',
    totalPredictions: 54,
    avgErrorMinutes: 14.7,
    accuracyPercent: 68,
    within5min: 28,
    within15min: 61,
  },
]
