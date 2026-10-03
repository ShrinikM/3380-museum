import{ useState } from 'react'
import{ Badge, StatCard } from '../components/ui'

const ticketTypes = ['Adult', 'Senior', 'Student', 'Child', 'Member']

const exhibitions = [
  { ExhibitionID: 1, Name: 'Modern Art' },
  { ExhibitionID: 2, Name: 'Ancient Americas' },
]

const memberships = [
  { MembershipID: 1, Name: 'Patricia Holloway' },
]

const tickets = [
  {
    TicketID: 1,
    ExhibitionID: 1,
    ExhibitionName: 'Modern Art',
    TicketType: 'Adult',
    Price: 25,
    SaleDate: '2026-09-28',
    MembershipID: null,
  },
  {
    TicketID: 2,
    ExhibitionID: 1,
    ExhibitionName: 'Modern Art',
    TicketType: 'Member',
    Price: 18,
    SaleDate: '2026-09-28',
    MembershipID: 1,
  },
  {
    TicketID: 3,
    ExhibitionID: 2,
    ExhibitionName: 'Ancient Americas',
    TicketType: 'Senior',
    Price: 20,
    SaleDate: '2026-09-27',
    MembershipID: null,
  },
]

const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
  Member: 18,
}

function Tickets(){
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [exhibition, setExhibition] = useState('all')

  const revenue = tickets.reduce((sum, ticket)=> sum + ticket.Price, 0)
  const memberTickets = tickets.filter((ticket)=> ticket.TicketType === 'Member').length

  const filtered = tickets.filter((ticket)=>{
    const matchesSearch =
      ticket.TicketID.toString().includes(search) ||
      ticket.ExhibitionName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.TicketType.toLowerCase().includes(search.toLowerCase())

    const matchesType =
      type === 'all' || ticket.TicketType === type

    const matchesExhibition =
      exhibition === 'all' || ticket.ExhibitionID.toString() === exhibition

    return matchesSearch && matchesType && matchesExhibition
  })

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">
            Ticket sales for each exhibition and membership.
          </p>
        </div>

        <button className="btn primary">Add Ticket</button>
      </div>

      <div className="grid-4 section-gap-sm">
        <StatCard
          label="Tickets Sold"
          value={tickets.length.toLocaleString()}
          delta="↑ 2"
          deltaLabel="last 30 days"
        />

        <StatCard
          label="Ticket Revenue"
          value={`$${revenue.toFixed(2)}`}
        />

        <StatCard
          label="Member Tickets"
          value={memberTickets}
          delta={`${tickets.length ? Math.round((memberTickets / tickets.length) * 100) : 0}%`}
          deltaLabel="of all tickets"
        />

        <StatCard
          label="Avg. Ticket Price"
          value={`$${(tickets.length ? revenue / tickets.length : 0).toFixed(2)}`}
        />
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search tickets..."
        />

        <select value={type} onChange={(e)=> setType(e.target.value)}>
          <option value="all">All Types</option>
          {ticketTypes.map((ticketType)=>(
            <option key={ticketType} value={ticketType}>{ticketType}</option>
          ))}
        </select>

        <select value={exhibition} onChange={(e)=> setExhibition(e.target.value)}>
          <option value="all">All Exhibitions</option>
          {exhibitions.map((item)=>(
            <option key={item.ExhibitionID} value={item.ExhibitionID}>
              {item.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Exhibition</th>
              <th>Type</th>
              <th>Price</th>
              <th>Sale Date</th>
              <th>Membership</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ticket)=>(
              <tr key={ticket.TicketID}>
                <td className="mono">
                  #{String(ticket.TicketID).padStart(5, '0')}
                </td>
                <td>{ticket.ExhibitionName}</td>
                <td>
                  <Badge
                    variant={ticket.TicketType.toLowerCase()}
                    label={ticket.TicketType}
                  />
                </td>
                <td className="mono">${ticket.Price.toFixed(2)}</td>
                <td className="mono">{ticket.SaleDate}</td>
                <td>
                  {ticket.MembershipID
                    ? <span className="chip chip-primary">
                        {memberships.find((member)=> member.MembershipID === ticket.MembershipID)?.Name}
                      </span>
                    : <span className="muted">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tickets