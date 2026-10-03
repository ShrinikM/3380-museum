import{ useState } from 'react'
import{ Badge, Panel } from '../components/ui'

const exhibitions = [
  {
    ExhibitionID: 1,
    Name: 'Modern Art',
    Description: 'Modern and contemporary artwork exhibition.',
    StartDate: '2026-09-01',
    EndDate: '2026-12-15',
    Capacity: 500,
    Tickets: 320,
    StaffNames: ['K. Martinez'],
    ArtworkCount: 24,
    Status: 'active',
  },
  {
    ExhibitionID: 2,
    Name: 'Ancient Americas',
    Description: 'Art and objects from ancient American cultures.',
    StartDate: '2026-10-10',
    EndDate: '2027-02-20',
    Capacity: 180,
    Tickets: 0,
    StaffNames: ['T. Okafor'],
    ArtworkCount: 18,
    Status: 'upcoming',
  },
]

function Exhibitions(){
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = exhibitions.filter((exhibition)=>{
    const matchesSearch = exhibition.Name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === 'all' || exhibition.Status === status

    return matchesSearch && matchesStatus
  })

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exhibitions</h1>
          <p className="page-subtitle">
            Exhibition schedule, capacity, staff, and displayed artworks.
          </p>
        </div>

        <button className="btn primary">Add Exhibition</button>
      </div>

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'active').length}
          </div>
          <div className="summary-label">Active Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'upcoming').length}
          </div>
          <div className="summary-label">Upcoming Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'completed').length}
          </div>
          <div className="summary-label">Completed Exhibitions</div>
        </Panel>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search exhibitions..."
        />

        <select value={status} onChange={(e)=> setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exhibition</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Tickets / Capacity</th>
              <th>Staff</th>
              <th>Artworks</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((exhibition)=>(
              <tr key={exhibition.ExhibitionID}>
                <td>
                  <div className="strong">{exhibition.Name}</div>
                  <div className="cell-sub">{exhibition.Description}</div>
                </td>
                <td>{exhibition.StartDate}</td>
                <td>{exhibition.EndDate}</td>
                <td>{exhibition.Tickets} / {exhibition.Capacity}</td>
                <td>{exhibition.StaffNames.join(', ')}</td>
                <td>{exhibition.ArtworkCount}</td>
                <td><Badge variant={exhibition.Status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Exhibitions