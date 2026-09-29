import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Museum</h2>

      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/exhibitions">Exhibitions</Link>
        <Link to="/tickets">Tickets</Link>
        <Link to="/memberships">Memberships</Link>
      </nav>
    </aside>
  )
}

export default Sidebar