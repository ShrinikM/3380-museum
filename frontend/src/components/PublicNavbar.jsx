import { NavLink, useNavigate } from 'react-router-dom'
import { useRole } from '../context/role'

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function PublicNavbar(){
  const { user, logout } = useRole()
  const navigate = useNavigate()

  const handleLogout = ()=>{
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">CoogMuseum</span>
        <span
          className="brand-hand"
          style={{ WebkitMaskImage: `url(${HAND})`, maskImage: `url(${HAND})` }}
          aria-hidden="true"
        />
      </div>

      <nav className="navbar-links">
        <NavLink to="/" end className="navbar-link">
          Home
        </NavLink>

        <NavLink to="/about" className="navbar-link">
          About
        </NavLink>

        <NavLink to="/gallery" className="navbar-link">
          Gallery
        </NavLink>

        {user === null ? (
          <NavLink to="/login" className="btn secondary">
            Log In
          </NavLink>
        ) : (
          <>
            <NavLink to="/account" className="navbar-link">
              My Account
            </NavLink>

            <button type="button" className="btn secondary" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default PublicNavbar