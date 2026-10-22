import { NavLink } from 'react-router-dom'

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function PublicNavbar(){
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

        <NavLink to="/login" className="btn secondary">
          Login / Sign up
        </NavLink>
      </nav>
    </header>
  )
}

export default PublicNavbar