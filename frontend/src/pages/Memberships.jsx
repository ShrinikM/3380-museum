import{ useState } from 'react'
import{ Badge, Panel, StatCard } from '../components/ui'

const membershipTypes = ['Individual', 'Family', 'Student', 'Senior']

const memberships = [
  {
    id: 1,
    firstName: 'Patricia',
    lastName: 'Holloway',
    email: 'patricia@example.com',
    type: 'Senior',
    startDate: '2026-08-15',
    endDate: '2027-08-15',
    price: 60,
    discount: 15,
    payment: 'Credit Card',
    status: 'active',
  },
  {
    id: 2,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james@example.com',
    type: 'Individual',
    startDate: '2026-09-01',
    endDate: '2027-09-01',
    price: 75,
    discount: 5,
    payment: 'Credit Card',
    status: 'active',
  },
  {
    id: 3,
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@example.com',
    type: 'Student',
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    price: 40,
    discount: 10,
    payment: 'Cash',
    status: 'upcoming',
  },
]

const membershipPrices = {
  Individual: 75,
  Family: 150,
  Student: 40,
  Senior: 60,
}

function Memberships(){
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  const active = memberships.filter((member)=> member.status === 'active')
  const upcoming = memberships.filter((member)=> member.status === 'upcoming')
  const expired = memberships.filter((member)=> member.status === 'expired')

  const revenue = memberships.reduce((sum, member)=> sum + member.price, 0)

  const filtered = memberships.filter((member)=>{
    const name = `${member.firstName} ${member.lastName}`.toLowerCase()

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())

    const matchesType = type === 'all' || member.type === type
    const matchesStatus = status === 'all' || member.status === status

    return matchesSearch && matchesType && matchesStatus
  })

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Memberships</h1>
          <p className="page-subtitle">
            Member accounts, membership periods, and discounts.
          </p>
        </div>

        <button className="btn primary">Add Membership</button>
      </div>

      <div className="grid-4 section-gap-sm">
        <StatCard label="Active Members" value={active.length} />
        <StatCard label="Upcoming" value={upcoming.length} />
        <StatCard label="Expired" value={expired.length} />
        <StatCard label="Membership Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>

      <div className="grid-4 section-gap-sm tight">
        {membershipTypes.map((membershipType)=>(
          <Panel key={membershipType} className="price-card">
            <div className="price-top">
              <div>
                <div className="stat-label">{membershipType}</div>
                <div className="price-value">
                  ${membershipPrices[membershipType]}<span>/yr</span>
                </div>
              </div>

              <Badge
                variant={membershipType.toLowerCase()}
                label={membershipType}
              />
            </div>

            <div className="price-count">
              {active.filter((member)=> member.type === membershipType).length} active
            </div>
          </Panel>
        ))}
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search members or email..."
        />

        <select value={type} onChange={(e)=> setType(e.target.value)}>
          <option value="all">All Types</option>
          {membershipTypes.map((membershipType)=>(
            <option key={membershipType} value={membershipType}>
              {membershipType}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e)=> setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((member)=>(
              <tr key={member.id}>
                <td>
                  <div className="strong">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="cell-sub mono">{member.email}</div>
                </td>

                <td>
                  <Badge
                    variant={member.type.toLowerCase()}
                    label={member.type}
                  />
                </td>

                <td className="mono">{member.startDate}</td>
                <td className="mono">{member.endDate}</td>
                <td className="mono">${member.price.toFixed(2)}</td>
                <td className="mono">{member.discount}%</td>
                <td className="muted nowrap">{member.payment}</td>
                <td><Badge variant={member.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Memberships