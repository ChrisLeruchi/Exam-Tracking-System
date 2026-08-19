import './App.css'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { Results } from './components/Result'
import { Dashboard } from './components/Dashboard'
import { EntryPoint } from './components/EntryPoint'
import { SideMenu } from './assets/SideMenu'
import { Home, LayoutListIcon, FileText, GraduationCap, ShieldAlert, ScrollText, Shield } from 'lucide-react'
import { ChangeHistory } from './components/ChangeHistory'
import { StudentManagement } from './components/StudentManagement'
import { AuditLog } from './components/AuditLog'
import { TamperAlerts } from './components/TamperAlerts'
import { Admin } from './components/Admin'

import { useAuth } from './context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import api from './api/axios.js'

// All navigation items — each has a roles array specifying who can see it
const allNavigators = [
  { id: 1, name: 'Dashboard', path: '/dashboard', icon: <Home size={18} />, roles: ['ADMIN', 'LECTURER', 'EXAM_OFFICER'] },
  { id: 2, name: 'Results', path: '/results', icon: <FileText size={18} />, roles: ['ADMIN', 'LECTURER', 'EXAM_OFFICER'] },
  { id: 3, name: 'Students', path: '/students', icon: <GraduationCap size={18} />, roles: ['ADMIN', 'LECTURER', 'EXAM_OFFICER'] },
  { id: 4, name: 'Change History', path: '/change-history', icon: <LayoutListIcon size={18} />, roles: ['ADMIN', 'LECTURER', 'EXAM_OFFICER'] },
  { id: 5, name: 'Tamper Alerts', path: '/tamper-alerts', icon: <ShieldAlert size={18} />, roles: ['ADMIN', 'EXAM_OFFICER'] },
  { id: 6, name: 'Audit Log', path: '/audit-log', icon: <ScrollText size={18} />, roles: ['ADMIN'] },
  { id: 7, name: 'Administrator', path: '/admin', icon: <Shield size={18} />, roles: ['ADMIN'] },
]


function AppLayout() {
  const { user } = useAuth()
  const [flaggedCount, setFlaggedCount] = useState(0)

  // Filter navigators based on the user's role
  const navigators = allNavigators.filter(nav =>
    !nav.roles || nav.roles.includes(user?.role)
  )

  // Attach flaggedCount badge to Tamper Alerts nav item when available
  const navigatorsWithBadges = navigators.map(nav =>
    nav.path === '/tamper-alerts' ? { ...nav, badge: flaggedCount } : nav
  )

  useEffect(() => {
    async function loadFlagged() {
      try {
        // Fetch unresolved flags (server returns pagination.total)
        const res = await api.get('/flags?resolved=false')
        const total = res.data?.pagination?.total
        if (typeof total === 'number') {
          setFlaggedCount(total)
        } else {
          setFlaggedCount(res.data.flags?.length || 0)
        }
      } catch (e) {
        setFlaggedCount(0)
      }
    }
    loadFlagged()
    // Listen for updates from TamperAlerts (so the badge stays in sync)
    function onFlagsUpdated(e) {
      if (e?.detail?.total !== undefined) {
        setFlaggedCount(Number(e.detail.total) || 0)
      } else {
        // fallback: reload
        loadFlagged()
      }
    }

    window.addEventListener('flags-updated', onFlagsUpdated)
    return () => window.removeEventListener('flags-updated', onFlagsUpdated)
  }, [user])

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <SideMenu navigators={navigatorsWithBadges} />
      <Outlet />
    </div>
  )
}

// Protected route — redirects to login if not authenticated
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="flex h-screen items-center justify-center text-text-muted">Loading...</div>
  if (!isAuthenticated) return <Navigate to='/' replace />

  return <AppLayout />
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path='/' element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <EntryPoint />} />
      <Route element={<ProtectedRoute />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/results' element={<Results />} />
        <Route path='/students' element={<StudentManagement />} />
        <Route path='/change-history' element={<ChangeHistory />} />
        <Route path='/tamper-alerts' element={<TamperAlerts />} />
        <Route path='/audit-log' element={<AuditLog />} />
        <Route path='/admin' element={<Admin />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
