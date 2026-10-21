import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/role'

function Navbar({ onToggleSidebar, sidebarOpen }) {
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
      </div>

      <div className="navbar-right">
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
