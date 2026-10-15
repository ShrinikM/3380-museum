import { useState, useEffect } from 'react'
import { Badge, StatCard, Modal } from '../components/ui'

const ticketTypes = ['Adult', 'Senior', 'Student', 'Child', 'Member']


const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
  Member: 18,
}

const emptyForm = {
  ExhibitionID: '',
  TicketType: '',
  Price: '',
  SaleDate: '',
  MembershipID: '',
}

function Tickets() {
  const today = new Date().toISOString().split('T')[0]

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [exhibition, setExhibition] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [exhibitions, setExhibitions] = useState([])
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tickets, setTickets] = useState([])

  const [formData, setFormData] = useState(emptyForm)


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          ticketsResponse,
          exhibitionsResponse,
          membershipsResponse,
        ] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/exhibitions'),
          fetch('/api/memberships'),
        ])

        if (
          !ticketsResponse.ok ||
          !exhibitionsResponse.ok ||
          !membershipsResponse.ok
        ) {
          throw new Error(
            'Failed to load tickets, exhibitions, or memberships.'
          )
        }

        const ticketsData = await ticketsResponse.json()
        const exhibitionsData = await exhibitionsResponse.json()
        const membershipsData = await membershipsResponse.json()

        setTickets(
          ticketsData.map((ticket) => ({
            ...ticket,
            Price: Number(ticket.Price),
          }))
        )

        setExhibitions(exhibitionsData)
        setMemberships(membershipsData)
      } catch (err) {
        console.error('Error loading Tickets page:', err)
        setError(err.message || 'Unable to load data from the server.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])



  const revenue = tickets.reduce((sum, ticket) => sum + ticket.Price, 0)

  const memberTickets = tickets.filter(
    (ticket) => ticket.TicketType === 'Member'
  ).length

  const filtered = tickets.filter((ticket) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      ticket.TicketID.toString().includes(searchText) ||
      ticket.ExhibitionName.toLowerCase().includes(searchText) ||
      ticket.TicketType.toLowerCase().includes(searchText)

    const matchesType = type === 'all' || ticket.TicketType === type

    const matchesExhibition =
      exhibition === 'all' ||
      ticket.ExhibitionID.toString() === exhibition

    return matchesSearch && matchesType && matchesExhibition
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTypeChange = (e) => {
    const value = e.target.value

    setFormData({
      ...formData,
      TicketType: value,
      Price: value ? ticketPrices[value] : '',
      MembershipID: value === 'Member' ? formData.MembershipID : '',
    })
  }

  const handleMembershipChange = (e) => {
    const membershipID = e.target.value

    const membership = memberships.find(
      (member) => member.MembershipID === Number(membershipID)
    )

    const basePrice = ticketPrices[formData.TicketType] || 0
    const discount = membership ? Number(membership.DiscountPercent) : 0
    const price = basePrice * (1 - discount / 100)

    setFormData({
      ...formData,
      MembershipID: membershipID,
      Price: membershipID ? price.toFixed(2) : basePrice,
    })
  }

  const resetForm = () => {
    setFormData(emptyForm)
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (ticket) => {
    setEditingId(ticket.TicketID)

    setFormData({
      ExhibitionID: String(ticket.ExhibitionID),
      TicketType: ticket.TicketType,
      Price: String(ticket.Price),
      SaleDate: ticket.SaleDate,
      MembershipID: ticket.MembershipID
        ? String(ticket.MembershipID)
        : '',
    })

    setOpen(true)
  }

  const closeModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(false)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.ExhibitionID) {
      alert('Please select an Exhibition.')
      return
    }

    if (!ticketTypes.includes(formData.TicketType)) {
      alert('Please select a valid Ticket Type.')
      return
    }

    if (!formData.SaleDate || formData.SaleDate > today) {
      alert('Please select a valid Sale Date that is not in the future.')
      return
    }

    if (formData.TicketType === 'Member' && !formData.MembershipID) {
      alert('Member tickets require a Membership.')
      return
    }

    if (formData.TicketType !== 'Member' && formData.MembershipID) {
      alert('Only Member tickets can have a Membership.')
      return
    }

    const selectedExhibition = exhibitions.find(
      (item) => Number(item.ExhibitionID) === Number(formData.ExhibitionID)
    )

    if (!selectedExhibition) {
      alert('Please select a valid Exhibition.')
      return
    }

    const selectedMembership = memberships.find(
      (member) => Number(member.MembershipID) === Number(formData.MembershipID)
    )

    if (formData.MembershipID && !selectedMembership) {
      alert('Please select a valid Membership.')
      return
    }

    const price = Number(formData.Price)

    if (!Number.isFinite(price) || price <= 0) {
      alert('Ticket price must be greater than 0.')
      return
    }

    const ticketData = {
      ExhibitionID: Number(formData.ExhibitionID),
      TicketType: formData.TicketType,
      SaleDate: formData.SaleDate,
      MembershipID: formData.MembershipID
        ? Number(formData.MembershipID)
        : null,
    }

    try {
      const response = await fetch(
        editingId !== null
          ? `/api/tickets/${editingId}`
          : '/api/tickets',
        {
          method: editingId !== null ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save ticket.')
      }


      const ticketsResponse = await fetch('/api/tickets')

      if (!ticketsResponse.ok) {
        throw new Error('Ticket saved, but the ticket list could not be refreshed.')
      }

      const ticketsData = await ticketsResponse.json()

      setTickets(
        ticketsData.map((ticket) => ({
          ...ticket,
          Price: Number(ticket.Price),
        }))
      )

      closeModal()
    } catch (err) {
      console.error('Error saving ticket:', err)
      alert(err.message || 'Unable to save ticket.')
    }
  }



  const handleDelete = async (ticketID) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this ticket?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/tickets/${ticketID}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete ticket.')
      }

      const ticketsResponse = await fetch('/api/tickets')

      if (!ticketsResponse.ok) {
        throw new Error('Ticket deleted, but the list could not be refreshed.')
      }

      const ticketsData = await ticketsResponse.json()

      setTickets(
        ticketsData.map((ticket) => ({
          ...ticket,
          Price: Number(ticket.Price),
        }))
      )
    } catch (err) {
      console.error('Error deleting ticket:', err)
      alert(err.message || 'Unable to delete ticket.')
    }
  }

  return (
    <div className="page">
      {loading && <p>Loading tickets...</p>}

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={openAddModal}
          aria-haspopup="dialog"
          aria-expanded={open}
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
          delta={`${tickets.length
              ? Math.round((memberTickets / tickets.length) * 100)
              : 0
            }%`}
          deltaLabel="of all tickets"
        />

        <StatCard
          label="Avg. Ticket Price"
          value={`$${(
            tickets.length ? revenue / tickets.length : 0
          ).toFixed(2)}`}
        />
      </div>

      <div className="toolbar">
        <label htmlFor="ticket-search" className="sr-only">
          Search tickets by number, exhibition, or type
        </label>
        <input
          id="ticket-search"
          name="ticketSearch"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets..."
        />

        <label htmlFor="ticket-type-filter" className="sr-only">
          Filter tickets by type
        </label>
        <select
          id="ticket-type-filter"
          name="ticketType"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All Types</option>
          {ticketTypes.map((ticketType) => (
            <option key={ticketType} value={ticketType}>
              {ticketType}
            </option>
          ))}
        </select>

        <label htmlFor="ticket-exhibition-filter" className="sr-only">
          Filter tickets by exhibition
        </label>
        <select
          id="ticket-exhibition-filter"
          name="ticketExhibition"
          value={exhibition}
          onChange={(e) => setExhibition(e.target.value)}
        >
          <option value="all">All Exhibitions</option>
          {exhibitions.map((item) => (
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
          <caption className="sr-only">Museum ticket sales</caption>
          <thead>
            <tr>
              <th scope="col">Ticket #</th>
              <th scope="col">Exhibition</th>
              <th scope="col">Type</th>
              <th scope="col">Price</th>
              <th scope="col">Sale Date</th>
              <th scope="col">Membership</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ticket) => {
              const member = memberships.find(
                (item) =>
                  Number(item.MembershipID) === Number(ticket.MembershipID)
              )

              return (
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
                    {member ? (
                      <span className="chip chip-primary">{member.Name}</span>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => openEditModal(ticket)}
                        aria-label={`Edit ticket ${ticket.TicketID}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => handleDelete(ticket.TicketID)}
                        aria-label={`Delete ticket ${ticket.TicketID}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId !== null ? 'Edit Ticket' : 'Add Ticket'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ticket-exhibition">Exhibition</label>
            <select
              id="ticket-exhibition"
              name="ExhibitionID"
              value={formData.ExhibitionID}
              onChange={handleChange}
              required
            >
              <option value="">Select Exhibition</option>
              {exhibitions.map((item) => (
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
            <label htmlFor="ticket-type">Ticket Type</label>
            <select
              id="ticket-type"
              name="TicketType"
              value={formData.TicketType}
              onChange={handleTypeChange}
              required
            >
              <option value="">Select Type</option>
              {ticketTypes.map((ticketType) => (
                <option key={ticketType} value={ticketType}>
                  {ticketType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-price">Price ($)</label>
            <input
              id="ticket-price"
              name="Price"
              type="number"
              min="0.01"
              max="999999.99"
              step="0.01"
              value={formData.Price}
              readOnly
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-sale-date">Sale Date</label>
            <input
              id="ticket-sale-date"
              name="SaleDate"
              type="date"
              value={formData.SaleDate}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-membership">Membership</label>
            <select
              id="ticket-membership"
              name="MembershipID"
              value={formData.MembershipID}
              onChange={handleMembershipChange}
              disabled={formData.TicketType !== 'Member'}
            >
              <option value="">No Membership</option>
              {memberships.map((member) => (
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
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {editingId !== null ? 'Save Changes' : 'Add Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tickets
