import { Link } from 'react-router-dom'
import Card from '../components/Card'

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Museum Database</h1>
        <p>Welcome to the Museum of Fine Arts, Houston database.</p>
      </div>

      <div className="dashboard-cards">
        <Card
          title="Artists"
          description="Manage museum artists and their information." 
          link=" /artists"
        />

        <Card
          title="Artworks"
          description="Manage artworks and their collections."
          link="#"
          linkText="View Artworks →"
        />

        <Card
          title="Exhibitions"
          description="Manage exhibitions and displayed artworks."
          link="/exhibitions"
        />

        <Card
          title="Tickets"
          description="Manage exhibition tickets and ticket sales."
          link="/tickets"
        />

        <Card
          title="Memberships"
          description="Manage museum memberships and member information."
          link="/memberships"
        />

        <Card
          title="Gift Shop & Cafe"
          description="Manage items, sales, and museum services."
          link="#"
          linkText="View Sales →"
        />
      </div>
    </div>
  )
}

export default Dashboard