// ── Credit costs per action (internal, not visible to user) ──

export const CREDIT_COSTS = {
  // Route Intelligence
  SINGLE_PREDICTION: 50,
  COMPARE_ROUTES: 80,
  WEEKLY_PLAN_ROUTE: 40,

  // Fleet Intelligence
  FLEET_OVERVIEW_LOAD: 10,
  FLEET_VEHICLE_ADD: 5,
  FLEET_VEHICLE_UPDATE: 3,
  FLEET_MAINTENANCE_LOAD: 10,
  FLEET_DOCUMENT_LOAD: 5,

  // Delivery Intelligence
  DELIVERY_LOAD: 10,
  DELIVERY_ADD: 5,
  DELIVERY_UPDATE: 3,
  DELIVERY_ETA_LOAD: 15,

  // Compliance Intelligence
  COMPLIANCE_HOURS_LOAD: 10,
  COMPLIANCE_HOURS_ADD: 5,
  COMPLIANCE_REPORT_LOAD: 20,
  COMPLIANCE_TACHOGRAPH_LOAD: 10,

  // Finance Intelligence
  FINANCE_MARGINS_LOAD: 15,
  FINANCE_MARGINS_ADD: 5,
  FINANCE_COSTS_LOAD: 15,
  FINANCE_CLIENTS_LOAD: 15,
  FINANCE_BUDGET_LOAD: 10,

  // Carbon Intelligence
  CARBON_EMISSIONS_LOAD: 15,
  CARBON_EMISSIONS_ADD: 5,
  CARBON_ESG_LOAD: 20,
  CARBON_OPTIMIZATION_LOAD: 10,

  // Logistic Intelligence (chatbot)
  CHAT_MESSAGE: 30,

  // Extra credits purchase
  EXTRA_CREDITS_MIN_PURCHASE: 1000,
  EXTRA_CREDITS_PRICE_EUR: 0.02,
} as const

// ── Plan daily limits ──

export const PLAN_DAILY_LIMITS: Record<string, number> = {
  free: 500,
  pro: 5000,
  team: 10000,
  enterprise: 999999,
}
