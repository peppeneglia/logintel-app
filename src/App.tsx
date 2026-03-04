import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ChatPage } from './components/chat/ChatPage'
import { RouteIntelligencePage } from './components/route-intelligence/RouteIntelligencePage'
import { SinglePrediction } from './components/route-intelligence/SinglePrediction'
import { WeeklyPlan } from './components/route-intelligence/WeeklyPlan'
import { CompareRoutes } from './components/route-intelligence/CompareRoutes'
import { ETAReport } from './components/route-intelligence/ETAReport'
import { PredictionHistory } from './components/route-intelligence/PredictionHistory'
import { ComingSoonPage } from './components/coming-soon/ComingSoonPage'
import { NotificationsPage } from './components/notifications/NotificationsPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { General } from './components/settings/General'
import { Profile } from './components/settings/Profile'
import { PlanCredits } from './components/settings/PlanCredits'
import { ApiKey } from './components/settings/ApiKey'
import { Billing } from './components/settings/Billing'
import { Team } from './components/settings/Team'

function App() {
  return (
    <Layout>
      <Routes>
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
      </Routes>
    </Layout>
  )
}

export default App
