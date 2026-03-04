import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './Layout'
import { ChatPage } from '../features/chat/pages/ChatPage'
import { RouteIntelligencePage } from '../features/route-intelligence/components/RouteIntelligencePage'
import { SinglePrediction } from '../features/route-intelligence/pages/SinglePrediction'
import { WeeklyPlan } from '../features/route-intelligence/pages/WeeklyPlan'
import { CompareRoutes } from '../features/route-intelligence/pages/CompareRoutes'
import { ETAReport } from '../features/route-intelligence/pages/ETAReport'
import { PredictionHistory } from '../features/route-intelligence/pages/PredictionHistory'
import { ComingSoonPage } from '../components/ComingSoonPage'
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage'
import { SettingsPage } from '../features/settings/components/SettingsPage'
import { General } from '../features/settings/pages/General'
import { Profile } from '../features/settings/pages/Profile'
import { PlanCredits } from '../features/settings/pages/PlanCredits'
import { ApiKey } from '../features/settings/pages/ApiKey'
import { Billing } from '../features/settings/pages/Billing'
import { Team } from '../features/settings/pages/Team'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'

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
      {/* Auth — standalone pages (no header/sidebar) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected app routes — require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Home */}
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

          {/* Blocked modules — Coming Soon */}
          <Route path="/fleet-intelligence/*" element={<ComingSoonPage moduleKey="fleet" />} />
          <Route path="/delivery-intelligence/*" element={<ComingSoonPage moduleKey="delivery" />} />
          <Route path="/compliance-intelligence/*" element={<ComingSoonPage moduleKey="compliance" />} />
          <Route path="/finance-intelligence/*" element={<ComingSoonPage moduleKey="finance" />} />
          <Route path="/carbon-intelligence/*" element={<ComingSoonPage moduleKey="carbon" />} />

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
