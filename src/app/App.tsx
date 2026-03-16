import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './Layout'

// Auth
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'

// Chat
import { ChatPage } from '../features/chat/pages/ChatPage'

// Route Intelligence
import { RouteIntelligencePage } from '../features/route-intelligence/components/RouteIntelligencePage'
import { SinglePrediction } from '../features/route-intelligence/pages/SinglePrediction'
import { WeeklyPlan } from '../features/route-intelligence/pages/WeeklyPlan'
import { CompareRoutes } from '../features/route-intelligence/pages/CompareRoutes'
import { ETAReport } from '../features/route-intelligence/pages/ETAReport'
import { PredictionHistory } from '../features/route-intelligence/pages/PredictionHistory'

// Fleet Intelligence
import { FleetIntelligencePage } from '../features/fleet-intelligence/components/FleetIntelligencePage'
import { FleetOverview } from '../features/fleet-intelligence/pages/FleetOverview'
import { PredictiveMaintenance } from '../features/fleet-intelligence/pages/PredictiveMaintenance'
import { VehicleAllocation } from '../features/fleet-intelligence/pages/VehicleAllocation'
import { OperationalCosts } from '../features/fleet-intelligence/pages/OperationalCosts'
import { DocumentExpiry } from '../features/fleet-intelligence/pages/DocumentExpiry'

// Delivery Intelligence
import { DeliveryIntelligencePage } from '../features/delivery-intelligence/components/DeliveryIntelligencePage'
import { DeliveryPerformance } from '../features/delivery-intelligence/pages/DeliveryPerformance'
import { ActiveTracking } from '../features/delivery-intelligence/pages/ActiveTracking'
import { DeliveryWindows } from '../features/delivery-intelligence/pages/DeliveryWindows'
import { CustomerNotifications } from '../features/delivery-intelligence/pages/CustomerNotifications'
import { ETAAccuracy } from '../features/delivery-intelligence/pages/ETAAccuracy'

// Compliance Intelligence
import { ComplianceIntelligencePage } from '../features/compliance-intelligence/components/ComplianceIntelligencePage'
import { DrivingHours } from '../features/compliance-intelligence/pages/DrivingHours'
import { Tachograph } from '../features/compliance-intelligence/pages/Tachograph'
import { DocumentsLicenses } from '../features/compliance-intelligence/pages/DocumentsLicenses'
import { ADRRegulations } from '../features/compliance-intelligence/pages/ADRRegulations'
import { ComplianceReport } from '../features/compliance-intelligence/pages/ComplianceReport'

// Finance Intelligence
import { FinanceIntelligencePage } from '../features/finance-intelligence/components/FinanceIntelligencePage'
import { RouteMargins } from '../features/finance-intelligence/pages/RouteMargins'
import { CostAnalysis } from '../features/finance-intelligence/pages/CostAnalysis'
import { ClientProfitability } from '../features/finance-intelligence/pages/ClientProfitability'
import { BudgetForecast } from '../features/finance-intelligence/pages/BudgetForecast'
import { PenaltiesBilling } from '../features/finance-intelligence/pages/PenaltiesBilling'

// Carbon Intelligence
import { CarbonIntelligencePage } from '../features/carbon-intelligence/components/CarbonIntelligencePage'
import { RouteEmissions } from '../features/carbon-intelligence/pages/RouteEmissions'
import { VehicleEmissions } from '../features/carbon-intelligence/pages/VehicleEmissions'
import { ESGReport } from '../features/carbon-intelligence/pages/ESGReport'
import { CO2Optimization } from '../features/carbon-intelligence/pages/CO2Optimization'
import { EmissionsHistory } from '../features/carbon-intelligence/pages/EmissionsHistory'

// Notifications
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage'

// Settings
import { SettingsPage } from '../features/settings/components/SettingsPage'
import { General } from '../features/settings/pages/General'
import { Profile } from '../features/settings/pages/Profile'
import { PlanCredits } from '../features/settings/pages/PlanCredits'
import { ApiKey } from '../features/settings/pages/ApiKey'
import { Billing } from '../features/settings/pages/Billing'
import { Team } from '../features/settings/pages/Team'

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
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
  )
}

export default App
