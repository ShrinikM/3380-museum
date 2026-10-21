import { NavLink } from 'react-router-dom'

function PublicNavbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">CoogMuseum</span>
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

        <NavLink to="/login" className="btn secondary">
          Login / Sign up
        </NavLink>
      </nav>
    </header>
  )
}

export default PublicNavbar
