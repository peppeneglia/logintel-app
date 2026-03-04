// ─── Types ───────────────────────────────────────

export interface AppNotification {
  id: string
  type: 'maintenance' | 'compliance' | 'delivery' | 'system' | 'weather'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
}

// ─── Mock Notifications ─────────────────────────

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    type: 'maintenance',
    title: 'Manutenzione predittiva: freni veicolo FI 234 AB',
    message: 'Il sistema ha rilevato un\'usura anomala delle pastiglie freno anteriori. Si consiglia intervento entro 5.000 km.',
    timestamp: '2026-02-25T08:30:00',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-02',
    type: 'compliance',
    title: 'Scadenza CQC autista Marco Rossi tra 15 giorni',
    message: 'La Carta di Qualificazione del Conducente di Marco Rossi scade il 12 marzo 2026. Avviare il rinnovo.',
    timestamp: '2026-02-25T07:15:00',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-03',
    type: 'delivery',
    title: 'Consegna completata: Milano \u2192 Roma (puntuale)',
    message: 'Il veicolo MI 567 CD ha completato la consegna presso il magazzino Roma Tiburtina con 0 minuti di ritardo.',
    timestamp: '2026-02-25T06:45:00',
    read: false,
    priority: 'low',
  },
  {
    id: 'notif-04',
    type: 'weather',
    title: 'Allerta meteo: neve prevista Brennero domani',
    message: 'Previsioni di nevicate sopra i 1.200m sul passo del Brennero per il 26 febbraio. Obbligo catene probabile. Considerare rotte alternative.',
    timestamp: '2026-02-25T06:00:00',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-05',
    type: 'compliance',
    title: 'Violazione ore guida: Luca Bianchi',
    message: 'L\'autista Luca Bianchi ha superato il limite di 9 ore di guida giornaliere in data 24/02. Registrato: 9h 42min.',
    timestamp: '2026-02-24T22:00:00',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-06',
    type: 'system',
    title: 'Download tachigrafo scaduto: 3 veicoli',
    message: 'I veicoli TO 891 EF, BO 456 IJ e VE 012 MN non effettuano il download dei dati tachigrafo da oltre 28 giorni.',
    timestamp: '2026-02-24T18:30:00',
    read: true,
    priority: 'medium',
  },
  {
    id: 'notif-07',
    type: 'delivery',
    title: 'Ritardo consegna: Bologna \u2192 Bari (+45 min)',
    message: 'Il veicolo BO 456 IJ ha accumulato un ritardo di 45 minuti sulla tratta Bologna-Bari a causa di traffico intenso sull\'A14.',
    timestamp: '2026-02-24T16:20:00',
    read: true,
    priority: 'medium',
  },
  {
    id: 'notif-08',
    type: 'maintenance',
    title: 'Cambio olio programmato: GE 789 KL',
    message: 'Il veicolo GE 789 KL ha raggiunto i 45.000 km dall\'ultimo cambio olio. Programmare intervento al prossimo rientro in sede.',
    timestamp: '2026-02-24T14:00:00',
    read: true,
    priority: 'medium',
  },
  {
    id: 'notif-09',
    type: 'system',
    title: 'Aggiornamento sistema completato',
    message: 'L\'aggiornamento del modulo Route Intelligence alla versione 2.4.1 e stato completato con successo.',
    timestamp: '2026-02-24T09:00:00',
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-10',
    type: 'weather',
    title: 'Nebbia fitta prevista in Pianura Padana',
    message: 'Visibilita ridotta sotto i 100m prevista domani mattina sulla A1 Milano-Bologna e A4 Torino-Venezia. Partenze consigliate dopo le 10:00.',
    timestamp: '2026-02-24T08:00:00',
    read: true,
    priority: 'medium',
  },
  {
    id: 'notif-11',
    type: 'delivery',
    title: 'Consegna completata: Genova \u2192 Venezia (in anticipo)',
    message: 'Il veicolo NA 123 GH ha completato la consegna a Venezia Marghera con 12 minuti di anticipo rispetto all\'ETA previsto.',
    timestamp: '2026-02-23T17:30:00',
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-12',
    type: 'compliance',
    title: 'Revisione veicolo in scadenza: PA 345 OP',
    message: 'La revisione del veicolo PA 345 OP scade il 20 marzo 2026. Prenotare appuntamento presso officina autorizzata.',
    timestamp: '2026-02-23T10:00:00',
    read: true,
    priority: 'medium',
  },
]
