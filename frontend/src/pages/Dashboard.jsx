function Dashboard() {
  return(
    <div className="dashboard">
      <h1>Museum Database</h1>
      <p>Welcome to the Museum of Fine Arts, Houston database.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Artists</h2>
          <p>Manage museum artists.</p>
        </div>

        <div className="dashboard-card">
          <h2>Artworks</h2>
          <p>Manage museum artworks.</p>
        </div>

        <div className="dashboard-card">
          <h2>Exhibitions</h2>
          <p>Manage exhibitions and displayed artworks.</p>
        </div>

        <div className="dashboard-card">
          <h2>Tickets</h2>
          <p>Manage exhibition tickets and sales.</p>
        </div>

        <div className="dashboard-card">
          <h2>Memberships</h2>
          <p>Manage museum memberships.</p>
        </div>

        <div className="dashboard-card">
          <h2>Gift Shop & Cafe</h2>
          <p>Manage items and sales.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard