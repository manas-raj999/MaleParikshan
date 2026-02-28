import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import OnboardingPage from '../pages/OnboardingPage'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import StreakPage from '../pages/StreakPage'
import MoodPage from '../pages/MoodPage'
import LearnPage from '../pages/LearnPage'
import ChatPage from '../pages/ChatPage'
import AdultModePage from '../pages/AdultModePage'
import ProfilePage from '../pages/ProfilePage'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      {/* App */}
      <Route path="/home" element={<Protected><HomePage /></Protected>} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/streak" element={<Protected><StreakPage /></Protected>} />
      <Route path="/mood" element={<Protected><MoodPage /></Protected>} />
      <Route path="/learn" element={<Protected><LearnPage /></Protected>} />
      <Route path="/modules" element={<Protected><LearnPage /></Protected>} />
      <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
      <Route path="/adult" element={<Protected><AdultModePage /></Protected>} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
