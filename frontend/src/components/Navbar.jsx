import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/role'
import AlertBell from './AlertBell'

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function Navbar({ alerts, onMarkAllRead, onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useRole()
  const navigate = useNavigate()

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
        <AlertBell alerts={alerts} onMarkAllRead={onMarkAllRead} />

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
          Log Out
        </button>
      </div>
    </header>
  )
}

export default Navbar