import { lazy, Suspense, type ComponentType } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './Layout'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'

// Every page is code-split into its own chunk and loaded on first navigation.
// Pages use named exports, so `lazy` needs a small adapter to pick the export.
function lazyPage<T extends Record<string, ComponentType>, K extends keyof T>(
  loader: () => Promise<T>,
  name: K,
) {
  return lazy(() => loader().then((mod) => ({ default: mod[name] })))
}

// Auth
const LoginPage = lazyPage(() => import('../features/auth/pages/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('../features/auth/pages/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = lazyPage(() => import('../features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyPage(() => import('../features/auth/pages/ResetPasswordPage'), 'ResetPasswordPage')

// Chat
const ChatPage = lazyPage(() => import('../features/chat/pages/ChatPage'), 'ChatPage')

// Route Intelligence
const RouteIntelligencePage = lazyPage(() => import('../features/route-intelligence/components/RouteIntelligencePage'), 'RouteIntelligencePage')
const SinglePrediction = lazyPage(() => import('../features/route-intelligence/pages/SinglePrediction'), 'SinglePrediction')
const WeeklyPlan = lazyPage(() => import('../features/route-intelligence/pages/WeeklyPlan'), 'WeeklyPlan')
const CompareRoutes = lazyPage(() => import('../features/route-intelligence/pages/CompareRoutes'), 'CompareRoutes')
const ETAReport = lazyPage(() => import('../features/route-intelligence/pages/ETAReport'), 'ETAReport')
const PredictionHistory = lazyPage(() => import('../features/route-intelligence/pages/PredictionHistory'), 'PredictionHistory')

// Fleet Intelligence
const FleetIntelligencePage = lazyPage(() => import('../features/fleet-intelligence/components/FleetIntelligencePage'), 'FleetIntelligencePage')
const FleetOverview = lazyPage(() => import('../features/fleet-intelligence/pages/FleetOverview'), 'FleetOverview')
const PredictiveMaintenance = lazyPage(() => import('../features/fleet-intelligence/pages/PredictiveMaintenance'), 'PredictiveMaintenance')
const VehicleAllocation = lazyPage(() => import('../features/fleet-intelligence/pages/VehicleAllocation'), 'VehicleAllocation')
const OperationalCosts = lazyPage(() => import('../features/fleet-intelligence/pages/OperationalCosts'), 'OperationalCosts')
const DocumentExpiry = lazyPage(() => import('../features/fleet-intelligence/pages/DocumentExpiry'), 'DocumentExpiry')

// Delivery Intelligence
const DeliveryIntelligencePage = lazyPage(() => import('../features/delivery-intelligence/components/DeliveryIntelligencePage'), 'DeliveryIntelligencePage')
const DeliveryPerformance = lazyPage(() => import('../features/delivery-intelligence/pages/DeliveryPerformance'), 'DeliveryPerformance')
const ActiveTracking = lazyPage(() => import('../features/delivery-intelligence/pages/ActiveTracking'), 'ActiveTracking')
const DeliveryWindows = lazyPage(() => import('../features/delivery-intelligence/pages/DeliveryWindows'), 'DeliveryWindows')
const CustomerNotifications = lazyPage(() => import('../features/delivery-intelligence/pages/CustomerNotifications'), 'CustomerNotifications')
const ETAAccuracy = lazyPage(() => import('../features/delivery-intelligence/pages/ETAAccuracy'), 'ETAAccuracy')

// Compliance Intelligence
const ComplianceIntelligencePage = lazyPage(() => import('../features/compliance-intelligence/components/ComplianceIntelligencePage'), 'ComplianceIntelligencePage')
const DrivingHours = lazyPage(() => import('../features/compliance-intelligence/pages/DrivingHours'), 'DrivingHours')
const Tachograph = lazyPage(() => import('../features/compliance-intelligence/pages/Tachograph'), 'Tachograph')
const DocumentsLicenses = lazyPage(() => import('../features/compliance-intelligence/pages/DocumentsLicenses'), 'DocumentsLicenses')
const ADRRegulations = lazyPage(() => import('../features/compliance-intelligence/pages/ADRRegulations'), 'ADRRegulations')
const ComplianceReport = lazyPage(() => import('../features/compliance-intelligence/pages/ComplianceReport'), 'ComplianceReport')

// Finance Intelligence
const FinanceIntelligencePage = lazyPage(() => import('../features/finance-intelligence/components/FinanceIntelligencePage'), 'FinanceIntelligencePage')
const RouteMargins = lazyPage(() => import('../features/finance-intelligence/pages/RouteMargins'), 'RouteMargins')
const CostAnalysis = lazyPage(() => import('../features/finance-intelligence/pages/CostAnalysis'), 'CostAnalysis')
const ClientProfitability = lazyPage(() => import('../features/finance-intelligence/pages/ClientProfitability'), 'ClientProfitability')
const BudgetForecast = lazyPage(() => import('../features/finance-intelligence/pages/BudgetForecast'), 'BudgetForecast')
const PenaltiesBilling = lazyPage(() => import('../features/finance-intelligence/pages/PenaltiesBilling'), 'PenaltiesBilling')

// Carbon Intelligence
const CarbonIntelligencePage = lazyPage(() => import('../features/carbon-intelligence/components/CarbonIntelligencePage'), 'CarbonIntelligencePage')
const RouteEmissions = lazyPage(() => import('../features/carbon-intelligence/pages/RouteEmissions'), 'RouteEmissions')
const VehicleEmissions = lazyPage(() => import('../features/carbon-intelligence/pages/VehicleEmissions'), 'VehicleEmissions')
const ESGReport = lazyPage(() => import('../features/carbon-intelligence/pages/ESGReport'), 'ESGReport')
const CO2Optimization = lazyPage(() => import('../features/carbon-intelligence/pages/CO2Optimization'), 'CO2Optimization')
const EmissionsHistory = lazyPage(() => import('../features/carbon-intelligence/pages/EmissionsHistory'), 'EmissionsHistory')

// Notifications
const NotificationsPage = lazyPage(() => import('../features/notifications/pages/NotificationsPage'), 'NotificationsPage')

// Settings
const SettingsPage = lazyPage(() => import('../features/settings/components/SettingsPage'), 'SettingsPage')
const General = lazyPage(() => import('../features/settings/pages/General'), 'General')
const Profile = lazyPage(() => import('../features/settings/pages/Profile'), 'Profile')
const PlanCredits = lazyPage(() => import('../features/settings/pages/PlanCredits'), 'PlanCredits')
const ApiKey = lazyPage(() => import('../features/settings/pages/ApiKey'), 'ApiKey')
const Billing = lazyPage(() => import('../features/settings/pages/Billing'), 'Billing')
const Team = lazyPage(() => import('../features/settings/pages/Team'), 'Team')

function PageFallback() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )
}

function AppLayout() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Auth routes (pubbliche) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard routes (protette) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Home — Chat */}
            <Route path="/" element={<ChatPage />} />

            {/* Route Intelligence */}
            <Route path="/route-intelligence" element={<RouteIntelligencePage />}>
              <Route index element={<Navigate to="single" replace />} />
              <Route path="single" element={<SinglePrediction />} />
              <Route path="weekly" element={<WeeklyPlan />} />
              <Route path="compare" element={<CompareRoutes />} />
              <Route path="report" element={<ETAReport />} />
              <Route path="history" element={<PredictionHistory />} />
            </Route>

            {/* Fleet Intelligence */}
            <Route path="/fleet-intelligence" element={<FleetIntelligencePage />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<FleetOverview />} />
              <Route path="maintenance" element={<PredictiveMaintenance />} />
              <Route path="allocation" element={<VehicleAllocation />} />
              <Route path="costs" element={<OperationalCosts />} />
              <Route path="documents" element={<DocumentExpiry />} />
            </Route>

            {/* Delivery Intelligence */}
            <Route path="/delivery-intelligence" element={<DeliveryIntelligencePage />}>
              <Route index element={<Navigate to="performance" replace />} />
              <Route path="performance" element={<DeliveryPerformance />} />
              <Route path="tracking" element={<ActiveTracking />} />
              <Route path="windows" element={<DeliveryWindows />} />
              <Route path="notifications" element={<CustomerNotifications />} />
              <Route path="accuracy" element={<ETAAccuracy />} />
            </Route>

            {/* Compliance Intelligence */}
            <Route path="/compliance-intelligence" element={<ComplianceIntelligencePage />}>
              <Route index element={<Navigate to="hours" replace />} />
              <Route path="hours" element={<DrivingHours />} />
              <Route path="tachograph" element={<Tachograph />} />
              <Route path="documents" element={<DocumentsLicenses />} />
              <Route path="adr" element={<ADRRegulations />} />
              <Route path="report" element={<ComplianceReport />} />
            </Route>

            {/* Finance Intelligence */}
            <Route path="/finance-intelligence" element={<FinanceIntelligencePage />}>
              <Route index element={<Navigate to="margins" replace />} />
              <Route path="margins" element={<RouteMargins />} />
              <Route path="costs" element={<CostAnalysis />} />
              <Route path="profitability" element={<ClientProfitability />} />
              <Route path="budget" element={<BudgetForecast />} />
              <Route path="penalties" element={<PenaltiesBilling />} />
            </Route>

            {/* Carbon Intelligence */}
            <Route path="/carbon-intelligence" element={<CarbonIntelligencePage />}>
              <Route index element={<Navigate to="routes" replace />} />
              <Route path="routes" element={<RouteEmissions />} />
              <Route path="vehicles" element={<VehicleEmissions />} />
              <Route path="esg" element={<ESGReport />} />
              <Route path="optimization" element={<CO2Optimization />} />
              <Route path="history" element={<EmissionsHistory />} />
            </Route>

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<General />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="plan" element={<PlanCredits />} />
              <Route path="apikey" element={<ApiKey />} />
              <Route path="team" element={<Team />} />
              <Route path="billing" element={<Billing />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
