// ── Italian license plate validation ──
// Formats: AB 123 CD (standard), AB 12345 (old), or free text for foreign plates
const PLATE_REGEX = /^[A-Z]{2}\s?\d{3}\s?[A-Z]{2}$/i

export function isValidPlate(plate: string): boolean {
  const trimmed = plate.trim()
  // Accept any plate with at least 5 chars (foreign plates have different formats)
  if (trimmed.length < 5) return false
  // Warn-only: Italian standard format
  return true
}

export function isItalianPlateFormat(plate: string): boolean {
  return PLATE_REGEX.test(plate.trim().replace(/\s+/g, ' '))
}

// ── Numeric range checks ──

export function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1990 && year <= 2030
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && value >= 0
}

export function isValidKm(km: number): boolean {
  return isPositiveNumber(km) && km <= 2_000_000
}

export function isValidCost(cost: number): boolean {
  return isPositiveNumber(cost) && cost <= 999_999
}

export function isValidWeight(kg: number): boolean {
  return isPositiveNumber(kg) && kg <= 50_000
}

export function isValidFuelConsumption(liters: number): boolean {
  return typeof liters === 'number' && isFinite(liters) && liters >= 5 && liters <= 100
}

export function isValidDrivingMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440
}

// ── Date checks ──

export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) > new Date()
}

export function isDateAfter(dateA: string, dateB: string): boolean {
  if (!dateA || !dateB) return true
  return new Date(dateA) >= new Date(dateB)
}

// ── Form error helper ──

export interface ValidationError {
  field: string
  message: string
}

export function validateVehicleForm(form: {
  plate: string
  brand: string
  model: string
  year: number
  total_km: number
  monthly_km: number
  fuel_consumption_per_100km: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (form.plate.trim().length < 5) {
    errors.push({ field: 'plate', message: 'La targa deve avere almeno 5 caratteri' })
  }
  if (!form.brand.trim()) {
    errors.push({ field: 'brand', message: 'La marca è obbligatoria' })
  }
  if (!form.model.trim()) {
    errors.push({ field: 'model', message: 'Il modello è obbligatorio' })
  }
  if (!isValidYear(form.year)) {
    errors.push({ field: 'year', message: `Anno non valido (1990-${new Date().getFullYear() + 1})` })
  }
  if (!isValidKm(form.total_km)) {
    errors.push({ field: 'total_km', message: 'Km totali non validi (0-2.000.000)' })
  }
  if (!isValidKm(form.monthly_km)) {
    errors.push({ field: 'monthly_km', message: 'Km mensili non validi' })
  }
  if (form.monthly_km > form.total_km && form.total_km > 0) {
    errors.push({ field: 'monthly_km', message: 'I km mensili non possono superare i km totali' })
  }
  if (form.fuel_consumption_per_100km > 0 && !isValidFuelConsumption(form.fuel_consumption_per_100km)) {
    errors.push({ field: 'fuel_consumption_per_100km', message: 'Consumo non valido (5-100 L/100km)' })
  }

  return errors
}

export function validateDeliveryForm(form: {
  customer: string
  origin: string
  destination: string
  departure_date: string
  scheduled_delivery_date: string
  actual_delivery_date: string
  weight_kg: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!form.customer.trim()) {
    errors.push({ field: 'customer', message: 'Il cliente è obbligatorio' })
  }
  if (!form.origin.trim()) {
    errors.push({ field: 'origin', message: "L'origine è obbligatoria" })
  }
  if (!form.destination.trim()) {
    errors.push({ field: 'destination', message: 'La destinazione è obbligatoria' })
  }
  if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
    errors.push({ field: 'destination', message: 'Origine e destinazione devono essere diverse' })
  }
  if (!form.departure_date) {
    errors.push({ field: 'departure_date', message: 'La data di partenza è obbligatoria' })
  }
  if (!form.scheduled_delivery_date) {
    errors.push({ field: 'scheduled_delivery_date', message: 'La data di consegna prevista è obbligatoria' })
  }
  if (form.departure_date && form.scheduled_delivery_date && !isDateAfter(form.scheduled_delivery_date, form.departure_date)) {
    errors.push({ field: 'scheduled_delivery_date', message: 'La consegna prevista deve essere dopo la partenza' })
  }
  if (form.actual_delivery_date && form.departure_date && !isDateAfter(form.actual_delivery_date, form.departure_date)) {
    errors.push({ field: 'actual_delivery_date', message: 'La consegna effettiva deve essere dopo la partenza' })
  }
  if (form.weight_kg > 0 && !isValidWeight(form.weight_kg)) {
    errors.push({ field: 'weight_kg', message: 'Peso non valido (0-50.000 kg)' })
  }

  return errors
}

export function validateRouteMarginForm(form: {
  route: string
  date: string
  km: number
  revenue: number
  fuel_cost: number
  driver_cost: number
  fixed_cost: number
  tolls: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!form.route.trim()) {
    errors.push({ field: 'route', message: 'La rotta è obbligatoria' })
  }
  if (!form.date) {
    errors.push({ field: 'date', message: 'La data è obbligatoria' })
  }
  if (!isValidKm(form.km) || form.km === 0) {
    errors.push({ field: 'km', message: 'Inserisci km validi (> 0)' })
  }
  if (!isValidCost(form.revenue)) {
    errors.push({ field: 'revenue', message: 'Ricavo non valido' })
  }
  if (!isValidCost(form.fuel_cost)) {
    errors.push({ field: 'fuel_cost', message: 'Costo carburante non valido' })
  }
  if (!isValidCost(form.driver_cost)) {
    errors.push({ field: 'driver_cost', message: 'Costo autista non valido' })
  }
  if (!isValidCost(form.fixed_cost)) {
    errors.push({ field: 'fixed_cost', message: 'Costi fissi non validi' })
  }
  if (!isValidCost(form.tolls)) {
    errors.push({ field: 'tolls', message: 'Pedaggi non validi' })
  }
  const totalCost = form.fuel_cost + form.driver_cost + form.fixed_cost + form.tolls
  if (totalCost > form.revenue * 5 && form.revenue > 0) {
    errors.push({ field: 'fuel_cost', message: 'I costi totali sembrano eccessivi rispetto al ricavo' })
  }

  return errors
}

export function validateEmissionsForm(form: {
  route: string
  km: number
  euro_class: string
  date: string
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!form.route.trim()) {
    errors.push({ field: 'route', message: 'La rotta è obbligatoria' })
  }
  if (!isValidKm(form.km) || form.km === 0) {
    errors.push({ field: 'km', message: 'Inserisci km validi (> 0)' })
  }
  if (!form.euro_class) {
    errors.push({ field: 'euro_class', message: 'La classe Euro è obbligatoria' })
  }
  if (!form.date) {
    errors.push({ field: 'date', message: 'La data è obbligatoria' })
  }

  return errors
}

export function validateDrivingHoursForm(form: {
  driver: string
  date: string
  driving_minutes: number
  break_minutes: number
  rest_minutes_after: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!form.driver.trim()) {
    errors.push({ field: 'driver', message: "Il nome dell'autista è obbligatorio" })
  }
  if (!form.date) {
    errors.push({ field: 'date', message: 'La data è obbligatoria' })
  }
  if (!isValidDrivingMinutes(form.driving_minutes)) {
    errors.push({ field: 'driving_minutes', message: 'Minuti guida non validi (0-1440)' })
  }
  if (form.driving_minutes > 0 && form.break_minutes === 0) {
    errors.push({ field: 'break_minutes', message: 'Inserisci i minuti di pausa' })
  }
  if (form.driving_minutes > 600) {
    errors.push({ field: 'driving_minutes', message: 'Attenzione: superamento limite giornaliero EU (540 min)' })
  }

  return errors
}
