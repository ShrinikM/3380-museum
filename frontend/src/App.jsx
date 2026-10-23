import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import PublicNavbar from './components/PublicNavbar'
import Sidebar from './components/Sidebar'
import Exhibitions from './pages/Exhibitions'
import Tickets from './pages/Tickets'
import Memberships from './pages/Memberships'
import GiftShop from './pages/GiftShop'
import Cafe from './pages/Cafe'
import Artists from './pages/Artists'
import Artworks from './pages/Artworks'
import Login from './pages/Login'
import Collections from './pages/Collections'
import Donations from './pages/Donations'
import Staff from './pages/Staff'
import Reports from './pages/Reports'
import Dashboard from './pages/Dashboard'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import CustomerPage from './pages/Customerpage'
import { useRole } from './context/role'
import { callApi } from './api'
import './App.css'

function NoAccess() {
  return (
    <div className="page">
      <h1 className="page-title">No access</h1>
      <p className="page-subtitle">Your role cannot view this page.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="page">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">Use the sidebar to choose a section.</p>
    </div>
  )
}

function PublicLayout() {
  return (
    <>
      <PublicNavbar />

      <main className="public-main">
        <Outlet />
      </main>
    </>
  )
}

function App() {
  const { user, canView } = useRole()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alerts, setAlerts] = useState([])
  const location = useLocation()

  const isCustomer = user !== null && user.role === 'Customer'

  useEffect(() => {
    if (user === null || user.role === 'Customer') {
      return
    }

    async function loadAlerts() {
      try {
        const data = await callApi('/api/alerts', 'GET')
        setAlerts(data)
      } catch {
        setAlerts([])
      }
    }

    loadAlerts()
  }, [user, location.pathname])

  if (user === null) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  if (isCustomer) {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/account" replace />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/account" element={<CustomerPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/account" replace />} />
      </Routes>
    )
  }

  const visibleAlerts = alerts.filter((alert) => canView(alert.Path))

  const protect = (path, page) => {
    return canView(path) ? page : <NoAccess />
  }

  return (
    <>
      <Navbar
        alerts={visibleAlerts}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        {sidebarOpen && <Sidebar alerts={visibleAlerts} />}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={protect('/dashboard', <Dashboard />)} />

            <Route path="/artists" element={protect('/artists', <Artists />)} />
            <Route path="/artworks" element={protect('/artworks', <Artworks />)} />
            <Route path="/collections" element={protect('/collections', <Collections />)} />
            <Route path="/exhibitions" element={protect('/exhibitions', <Exhibitions />)} />

            <Route path="/tickets" element={protect('/tickets', <Tickets />)} />
            <Route path="/memberships" element={protect('/memberships', <Memberships />)} />
            <Route path="/gift-shop" element={protect('/gift-shop', <GiftShop />)} />
            <Route path="/cafe" element={protect('/cafe', <Cafe />)} />

            <Route path="/donations" element={protect('/donations', <Donations />)} />
            <Route path="/staff" element={protect('/staff', <Staff />)} />
            <Route path="/reports" element={protect('/reports', <Reports />)} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App