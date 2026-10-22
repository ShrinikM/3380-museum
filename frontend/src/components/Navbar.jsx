import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useRole } from '../context/role'

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function Navbar({ alerts, onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useRole()
  const navigate = useNavigate()
  const [alertsOpen, setAlertsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <button
          type="button"
          className="brand-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          ☰
        </button>

        <span className="brand-name">CoogMuseum</span>
        <span
          className="brand-hand"
          style={{ WebkitMaskImage: `url(${HAND})`, maskImage: `url(${HAND})` }}
          aria-hidden="true"
        />
      </div>

      <div className="navbar-right">
        <div className="bell-wrap">
          <button
            type="button"
            className="bell-btn"
            onClick={() => setAlertsOpen(!alertsOpen)}
            aria-label="Alerts"
          >
            <Bell size={20} />

            {alerts.length > 0 && (
              <span className="bell-count">{alerts.length}</span>
            )}
          </button>

          {alertsOpen && (
            <div className="bell-menu">
              {alerts.length === 0 && (
                <div className="bell-empty">No alerts</div>
              )}

              {alerts.map((alert, index) => (
                <Link
                  key={index}
                  to={alert.Path}
                  className="bell-item"
                  onClick={() => setAlertsOpen(false)}
                >
                  {alert.Message}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="user">
          <span className="avatar">
            {user.username.slice(0, 2).toUpperCase()}
          </span>

          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>

        <button className="btn secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export default Navbar