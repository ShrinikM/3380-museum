import{ Link } from 'react-router-dom'

function Navbar(){
  return(
    <nav className="navbar">
      <div className="navbar-title">MFA Houston</div>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/exhibitions">Exhibitions</Link>
        <Link to="/tickets">Tickets</Link>
        <Link to="/memberships">Memberships</Link>
      </div>
    </nav>
  )
}

export default Navbar