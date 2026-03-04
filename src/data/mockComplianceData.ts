// ─── Types ───────────────────────────────────────

export interface DrivingHoursRecord {
  id: string
  driver: string
  date: string
  drivingMinutes: number
  restMinutes: number
  remainingDrivingMinutes: number
  weeklyDrivingHours: number
  status: 'compliant' | 'warning' | 'violation'
}

export interface TachographRecord {
  id: string
  driver: string
  vehiclePlate: string
  date: string
  drivingMinutes: number
  restMinutes: number
  otherWorkMinutes: number
  violations: number
  downloadStatus: 'current' | 'overdue' | 'pending'
}

export interface ComplianceDocument {
  id: string
  holder: string
  holderType: 'driver' | 'vehicle' | 'company'
  documentType: string
  number: string
  issueDate: string
  expiryDate: string
  status: 'valid' | 'expiring' | 'expired'
}

export interface ADRShipment {
  id: string
  unNumber: string
  adrClass: string
  description: string
  vehiclePlate: string
  driver: string
  route: string
  date: string
  status: 'compliant' | 'issue' | 'pending_review'
}

export interface ComplianceScore {
  category: string
  score: number
  maxScore: number
  status: 'good' | 'attention' | 'critical'
}

// ─── Mock Driving Hours ─────────────────────────

export const mockDrivingHours: DrivingHoursRecord[] = [
  {
    id: 'dh-001',
    driver: 'Marco Bianchi',
    date: '2026-02-25',
    drivingMinutes: 480,
    restMinutes: 75,
    remainingDrivingMinutes: 60,
    weeklyDrivingHours: 48,
    status: 'warning',
  },
  {
    id: 'dh-002',
    driver: 'Luca Rossi',
    date: '2026-02-25',
    drivingMinutes: 390,
    restMinutes: 90,
    remainingDrivingMinutes: 150,
    weeklyDrivingHours: 38,
    status: 'compliant',
  },
  {
    id: 'dh-003',
    driver: 'Alessandro Ferrara',
    date: '2026-02-25',
    drivingMinutes: 555,
    restMinutes: 45,
    remainingDrivingMinutes: 0,
    weeklyDrivingHours: 56,
    status: 'violation',
  },
  {
    id: 'dh-004',
    driver: 'Giovanni Conti',
    date: '2026-02-25',
    drivingMinutes: 360,
    restMinutes: 105,
    remainingDrivingMinutes: 180,
    weeklyDrivingHours: 32,
    status: 'compliant',
  },
  {
    id: 'dh-005',
    driver: 'Stefano Ricci',
    date: '2026-02-25',
    drivingMinutes: 510,
    restMinutes: 60,
    remainingDrivingMinutes: 30,
    weeklyDrivingHours: 52,
    status: 'warning',
  },
  {
    id: 'dh-006',
    driver: 'Paolo Marino',
    date: '2026-02-25',
    drivingMinutes: 420,
    restMinutes: 90,
    remainingDrivingMinutes: 120,
    weeklyDrivingHours: 40,
    status: 'compliant',
  },
  {
    id: 'dh-007',
    driver: 'Andrea Galli',
    date: '2026-02-24',
    drivingMinutes: 540,
    restMinutes: 50,
    remainingDrivingMinutes: 0,
    weeklyDrivingHours: 58,
    status: 'violation',
  },
  {
    id: 'dh-008',
    driver: 'Roberto Colombo',
    date: '2026-02-25',
    drivingMinutes: 300,
    restMinutes: 120,
    remainingDrivingMinutes: 240,
    weeklyDrivingHours: 28,
    status: 'compliant',
  },
]

// ─── Mock Tachograph Records ────────────────────

export const mockTachographRecords: TachographRecord[] = [
  {
    id: 'tach-001',
    driver: 'Marco Bianchi',
    vehiclePlate: 'FI 482 KT',
    date: '2026-02-25',
    drivingMinutes: 480,
    restMinutes: 75,
    otherWorkMinutes: 45,
    violations: 0,
    downloadStatus: 'current',
  },
  {
    id: 'tach-002',
    driver: 'Luca Rossi',
    vehiclePlate: 'MI 319 AB',
    date: '2026-02-25',
    drivingMinutes: 390,
    restMinutes: 90,
    otherWorkMinutes: 60,
    violations: 0,
    downloadStatus: 'current',
  },
  {
    id: 'tach-003',
    driver: 'Alessandro Ferrara',
    vehiclePlate: 'RM 751 GH',
    date: '2026-02-25',
    drivingMinutes: 555,
    restMinutes: 45,
    otherWorkMinutes: 30,
    violations: 3,
    downloadStatus: 'overdue',
  },
  {
    id: 'tach-004',
    driver: 'Giovanni Conti',
    vehiclePlate: 'TO 628 PL',
    date: '2026-02-25',
    drivingMinutes: 360,
    restMinutes: 105,
    otherWorkMinutes: 75,
    violations: 0,
    downloadStatus: 'current',
  },
  {
    id: 'tach-005',
    driver: 'Stefano Ricci',
    vehiclePlate: 'NA 504 RZ',
    date: '2026-02-24',
    drivingMinutes: 510,
    restMinutes: 60,
    otherWorkMinutes: 30,
    violations: 1,
    downloadStatus: 'pending',
  },
  {
    id: 'tach-006',
    driver: 'Paolo Marino',
    vehiclePlate: 'BO 913 VN',
    date: '2026-02-25',
    drivingMinutes: 420,
    restMinutes: 90,
    otherWorkMinutes: 50,
    violations: 0,
    downloadStatus: 'current',
  },
  {
    id: 'tach-007',
    driver: 'Andrea Galli',
    vehiclePlate: 'GE 177 DS',
    date: '2026-02-23',
    drivingMinutes: 540,
    restMinutes: 50,
    otherWorkMinutes: 20,
    violations: 2,
    downloadStatus: 'overdue',
  },
  {
    id: 'tach-008',
    driver: 'Roberto Colombo',
    vehiclePlate: 'VR 845 WX',
    date: '2026-02-25',
    drivingMinutes: 300,
    restMinutes: 120,
    otherWorkMinutes: 80,
    violations: 0,
    downloadStatus: 'pending',
  },
]

// ─── Mock Compliance Documents ──────────────────

export const mockComplianceDocuments: ComplianceDocument[] = [
  {
    id: 'doc-001',
    holder: 'Marco Bianchi',
    holderType: 'driver',
    documentType: 'CQC Merci',
    number: 'CQC-2021-48271',
    issueDate: '2021-06-15',
    expiryDate: '2026-06-15',
    status: 'valid',
  },
  {
    id: 'doc-002',
    holder: 'Luca Rossi',
    holderType: 'driver',
    documentType: 'Patente CE',
    number: 'MI8294731X',
    issueDate: '2020-03-10',
    expiryDate: '2026-03-10',
    status: 'expiring',
  },
  {
    id: 'doc-003',
    holder: 'FI 482 KT',
    holderType: 'vehicle',
    documentType: 'Revisione',
    number: 'REV-2025-09182',
    issueDate: '2025-08-20',
    expiryDate: '2026-08-20',
    status: 'valid',
  },
  {
    id: 'doc-004',
    holder: 'MI 319 AB',
    holderType: 'vehicle',
    documentType: 'Assicurazione RCA',
    number: 'POL-2025-77431',
    issueDate: '2025-04-01',
    expiryDate: '2026-04-01',
    status: 'expiring',
  },
  {
    id: 'doc-005',
    holder: 'Alessandro Ferrara',
    holderType: 'driver',
    documentType: 'Certificato ADR',
    number: 'ADR-2022-15839',
    issueDate: '2022-01-20',
    expiryDate: '2027-01-20',
    status: 'valid',
  },
  {
    id: 'doc-006',
    holder: 'RM 751 GH',
    holderType: 'vehicle',
    documentType: 'Revisione',
    number: 'REV-2024-63291',
    issueDate: '2024-11-05',
    expiryDate: '2025-11-05',
    status: 'expired',
  },
  {
    id: 'doc-007',
    holder: 'Logistica Pro S.r.l.',
    holderType: 'company',
    documentType: 'Licenza Conto Terzi',
    number: 'LIC-CT-2023-4412',
    issueDate: '2023-09-01',
    expiryDate: '2028-09-01',
    status: 'valid',
  },
  {
    id: 'doc-008',
    holder: 'Giovanni Conti',
    holderType: 'driver',
    documentType: 'CQC Merci',
    number: 'CQC-2019-33105',
    issueDate: '2019-12-01',
    expiryDate: '2024-12-01',
    status: 'expired',
  },
]

// ─── Mock ADR Shipments ─────────────────────────

export const mockADRShipments: ADRShipment[] = [
  {
    id: 'adr-001',
    unNumber: 'UN 1203',
    adrClass: '3',
    description: 'Benzina',
    vehiclePlate: 'FI 482 KT',
    driver: 'Marco Bianchi',
    route: 'Milano - Genova',
    date: '2026-02-25',
    status: 'compliant',
  },
  {
    id: 'adr-002',
    unNumber: 'UN 1005',
    adrClass: '2.3',
    description: 'Ammoniaca anidra',
    vehiclePlate: 'RM 751 GH',
    driver: 'Alessandro Ferrara',
    route: 'Roma - Napoli',
    date: '2026-02-25',
    status: 'issue',
  },
  {
    id: 'adr-003',
    unNumber: 'UN 1830',
    adrClass: '8',
    description: 'Acido solforico',
    vehiclePlate: 'TO 628 PL',
    driver: 'Giovanni Conti',
    route: 'Torino - Bologna',
    date: '2026-02-24',
    status: 'compliant',
  },
  {
    id: 'adr-004',
    unNumber: 'UN 1263',
    adrClass: '3',
    description: 'Vernici',
    vehiclePlate: 'NA 504 RZ',
    driver: 'Stefano Ricci',
    route: 'Napoli - Bari',
    date: '2026-02-25',
    status: 'pending_review',
  },
  {
    id: 'adr-005',
    unNumber: 'UN 2014',
    adrClass: '5.1',
    description: 'Perossido di idrogeno',
    vehiclePlate: 'BO 913 VN',
    driver: 'Paolo Marino',
    route: 'Bologna - Firenze',
    date: '2026-02-23',
    status: 'compliant',
  },
  {
    id: 'adr-006',
    unNumber: 'UN 1072',
    adrClass: '2.2',
    description: 'Ossigeno compresso',
    vehiclePlate: 'GE 177 DS',
    driver: 'Andrea Galli',
    route: 'Genova - Milano',
    date: '2026-02-25',
    status: 'issue',
  },
  {
    id: 'adr-007',
    unNumber: 'UN 1789',
    adrClass: '8',
    description: 'Acido cloridrico',
    vehiclePlate: 'MI 319 AB',
    driver: 'Luca Rossi',
    route: 'Milano - Verona',
    date: '2026-02-24',
    status: 'compliant',
  },
]

// ─── Mock Compliance Scores ─────────────────────

export const mockComplianceScores: ComplianceScore[] = [
  {
    category: 'Ore guida',
    score: 82,
    maxScore: 100,
    status: 'attention',
  },
  {
    category: 'Documentazione',
    score: 68,
    maxScore: 100,
    status: 'critical',
  },
  {
    category: 'ADR',
    score: 91,
    maxScore: 100,
    status: 'good',
  },
  {
    category: 'Veicoli',
    score: 74,
    maxScore: 100,
    status: 'attention',
  },
  {
    category: 'Formazione',
    score: 95,
    maxScore: 100,
    status: 'good',
  },
]
