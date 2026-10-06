import{ useState } from 'react'
import{ Badge, StatCard, Modal } from '../components/ui'

const ticketTypes = ['Adult', 'Senior', 'Student', 'Child', 'Member']

const exhibitions = [
  { ExhibitionID: 1, Name: 'Modern Art' },
  { ExhibitionID: 2, Name: 'Ancient Americas' },
]

const memberships = [
  { MembershipID: 1, Name: 'Patricia Holloway', Type: 'Senior', Discount: 15 },
]

const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
  Member: 18,
}

function Tickets(){
  const today = new Date().toISOString().split('T')[0]

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [exhibition, setExhibition] = useState('all')
  const [open, setOpen] = useState(false)

  const [tickets, setTickets] = useState([
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
  ])

  const [formData, setFormData] = useState({
    ExhibitionID: '',
    TicketType: '',
    Price: '',
    SaleDate: '',
    MembershipID: ''
  })

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTypeChange = (e) => {
    const value = e.target.value

    setFormData({
      ...formData,
      TicketType: value,
      Price: ticketPrices[value] || '',
      MembershipID: value === 'Member' ? formData.MembershipID : ''
    })
  }

  const handleMembershipChange = (e) => {
    const membershipID = e.target.value
    const membership = memberships.find(
      (member)=> member.MembershipID === Number(membershipID)
    )

    const basePrice = ticketPrices[formData.TicketType] || 0
    const discount = membership ? membership.Discount : 0
    const price = basePrice * (1 - discount / 100)

    setFormData({
      ...formData,
      MembershipID: membershipID,
      Price: membershipID ? price.toFixed(2) : basePrice
    })
  }

  const resetForm = () => {
    setFormData({
      ExhibitionID: '',
      TicketType: '',
      Price: '',
      SaleDate: '',
      MembershipID: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if(!formData.ExhibitionID){
      alert('Please select an Exhibition.')
      return
    }

    if(!formData.TicketType){
      alert('Please select a Ticket Type.')
      return
    }

    if(!formData.SaleDate){
      alert('Please select a Sale Date.')
      return
    }

    if(formData.SaleDate > today){
      alert('Sale Date cannot be in the future.')
      return
    }

    if(formData.TicketType === 'Member' && !formData.MembershipID){
      alert('Member tickets require a Membership.')
      return
    }

    if(formData.TicketType !== 'Member' && formData.MembershipID){
      alert('Only Member tickets can have a Membership.')
      return
    }

    const selectedExhibition = exhibitions.find(
      (item)=> item.ExhibitionID === Number(formData.ExhibitionID)
    )

    const newTicket = {
      TicketID: Math.max(...tickets.map((ticket)=> ticket.TicketID), 0) + 1,
      ExhibitionID: Number(formData.ExhibitionID),
      ExhibitionName: selectedExhibition.Name,
      TicketType: formData.TicketType,
      Price: Number(formData.Price),
      SaleDate: formData.SaleDate,
      MembershipID: formData.MembershipID
        ? Number(formData.MembershipID)
        : null
    }

    setTickets([...tickets, newTicket])
    resetForm()
    setOpen(false)
  }

  const handleDelete = (ticketID) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this ticket?'
    )

    if(!confirmed){
      return
    }

    setTickets(
      tickets.filter((ticket)=> ticket.TicketID !== ticketID)
    )
  }

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">
            Ticket sales for each exhibition and membership.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={()=>{
            resetForm()
            setOpen(true)
          }}
        >
          Add Ticket
        </button>
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

        <select
          value={type}
          onChange={(e)=> setType(e.target.value)}
        >
          <option value="all">All Types</option>

          {ticketTypes.map((ticketType)=>(
            <option key={ticketType} value={ticketType}>
              {ticketType}
            </option>
          ))}
        </select>

        <select
          value={exhibition}
          onChange={(e)=> setExhibition(e.target.value)}
        >
          <option value="all">All Exhibitions</option>

          {exhibitions.map((item)=>(
            <option
              key={item.ExhibitionID}
              value={item.ExhibitionID}
            >
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
              <th>Actions</th>
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

                <td className="mono">
                  ${ticket.Price.toFixed(2)}
                </td>

                <td className="mono">
                  {ticket.SaleDate}
                </td>

                <td>
                  {ticket.MembershipID
                    ? (
                      <span className="chip chip-primary">
                        {memberships.find(
                          (member)=> member.MembershipID === ticket.MembershipID
                        )?.Name}
                      </span>
                    )
                    : (
                      <span className="muted">-</span>
                    )}
                </td>

                <td>
                  <button
                    className="btn danger"
                    onClick={()=> handleDelete(ticket.TicketID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title="Add Ticket"
        onClose={()=>{
          resetForm()
          setOpen(false)
        }}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Exhibition</label>

            <select
              name="ExhibitionID"
              value={formData.ExhibitionID}
              onChange={handleChange}
              required
            >
              <option value="">Select Exhibition</option>

              {exhibitions.map((item)=>(
                <option
                  key={item.ExhibitionID}
                  value={item.ExhibitionID}
                >
                  {item.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ticket Type</label>

            <select
              name="TicketType"
              value={formData.TicketType}
              onChange={handleTypeChange}
              required
            >
              <option value="">Select Type</option>

              {ticketTypes.map((ticketType)=>(
                <option
                  key={ticketType}
                  value={ticketType}
                >
                  {ticketType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>

            <input
              name="Price"
              type="number"
              min="0.01"
              max="999999.99"
              step="0.01"
              value={formData.Price}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Sale Date</label>

            <input
              name="SaleDate"
              type="date"
              value={formData.SaleDate}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

          <div className="form-group">
            <label>Membership</label>

            <select 
              name="MembershipID" 
              value={formData.MembershipID} 
              onChange={handleMembershipChange} 
              disabled={formData.TicketType !== 'Member'} 
            >
              <option value="">No Membership</option>

              {memberships.map((member)=>(
                <option
                  key={member.MembershipID}
                  value={member.MembershipID}
                >
                  {member.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={()=>{
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
            >
              Add Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tickets