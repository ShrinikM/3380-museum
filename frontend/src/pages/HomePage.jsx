import { NavLink } from 'react-router-dom'

function HomePage() {
  return (
    <div className="home-hero">
      <h1>CoogMuseum</h1>

      <NavLink to="/gallery" className="btn primary">
        Browse Catalog
      </NavLink>
    </div>
  )
}

export default HomePage
