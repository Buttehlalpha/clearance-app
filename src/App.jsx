import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import VerifyCertificate from './pages/VerifyCertificate.jsx'
import Preloader from './components/Preloader.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OfficerDashboard from './pages/OfficerDashboard.jsx'
import UserManagement from './pages/UserManagement.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1300)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Preloader visible={loading} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyCertificate />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="review" element={<OfficerDashboard allStages />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
