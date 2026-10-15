import { useAuth } from '../context/AuthContext.jsx'
import StudentDashboard from './StudentDashboard.jsx'
import OfficerDashboard from './OfficerDashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'

export default function Dashboard() {
  const { role } = useAuth()

  if (role === 'student') return <StudentDashboard />
  if (role === 'officer') return <OfficerDashboard />
  if (role === 'administrator') return <AdminDashboard />

  return <p className="text-ink/50">Loading your dashboard…</p>
}
