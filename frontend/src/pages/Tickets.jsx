import { useState, useEffect } from 'react'
import { Badge, Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

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
  const { canEdit } = useRole()
  const allowEdit = canEdit('/tickets')
  const today = new Date().toISOString().split('T')[0]

  const [tickets, setTickets] = useState([])
  const [exhibitions, setExhibitions] = useState([])
  const [memberships, setMemberships] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [exhibition, setExhibition] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsData, exhibitionsData, membershipsData] =
          await Promise.all([
            callApi('/api/tickets', 'GET'),
            callApi('/api/exhibitions', 'GET'),
            callApi('/api/memberships', 'GET'),
          ])

        setTickets(
          ticketsData.map((ticket) => ({
            ...ticket,
            Price: Number(ticket.Price),
          }))
        )

        setExhibitions(exhibitionsData)
        setMemberships(membershipsData)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load tickets: ' + err.message)
      }
    }

    loadData()
  }, [reloadCount])

  const refetchTickets = () => {
    setReloadCount((count) => count + 1)
  }

  const revenue = tickets.reduce((sum, ticket) => sum + ticket.Price, 0)

  const memberTickets = tickets.filter(
    (ticket) => ticket.TicketType === 'Member'
  ).length

  const filtered = tickets.filter((ticket) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      String(ticket.TicketID).includes(searchText) ||
      (ticket.ExhibitionName || '').toLowerCase().includes(searchText) ||
      (ticket.TicketType || '').toLowerCase().includes(searchText)

    const matchesType = type === 'all' || ticket.TicketType === type

    const matchesExhibition =
      exhibition === 'all' || String(ticket.ExhibitionID) === exhibition

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
      (member) => Number(member.MembershipID) === Number(membershipID)
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
      SaleDate: ticket.SaleDate ? ticket.SaleDate.split('T')[0] : '',
      MembershipID: ticket.MembershipID ? String(ticket.MembershipID) : '',
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
      if (editingId === null) {
        await callApi('/api/tickets', 'POST', ticketData)
      } else {
        await callApi('/api/tickets/' + editingId, 'PUT', ticketData)
      }
    } catch (err) {
      alert(err.message)
      return
    }

    closeModal()
    clear()
    refetchTickets()
  }

  const {
    selectedRows: selectedTickets,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filtered, (ticket) => ticket.TicketID)

  const handleEditSelected = () => {
    openEditModal(selectedTickets[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'ticket',
      (ticket) => `Ticket ${ticket.TicketID}`,
      (ticket) => callApi('/api/tickets/' + ticket.TicketID, 'DELETE')
    )

    if (deleted) refetchTickets()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedTickets.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Ticket
            </button>
          </div>
        )}
      </div>

      <div className="grid-4 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">
            {tickets.length.toLocaleString()}
          </div>
          <div className="summary-label">Tickets Sold</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">${revenue.toFixed(2)}</div>
          <div className="summary-label">Ticket Revenue</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{memberTickets}</div>
          <div className="summary-label">Member Tickets</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            ${(tickets.length ? revenue / tickets.length : 0).toFixed(2)}
          </div>
          <div className="summary-label">Avg. Ticket Price</div>
        </Panel>
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="ticket-search" className="sr-only">
            Search tickets by number, exhibition, or type
          </label>
          <input
            id="ticket-search"
            name="ticketSearch"
            type="search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="ticket-type-filter" className="sr-only">
            Filter by Ticket Type
          </label>
          <select
            id="ticket-type-filter"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Types</option>
            {ticketTypes.map((ticketType) => (
              <option key={ticketType} value={ticketType}>
                {ticketType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ticket-exhibition-filter" className="sr-only">
            Filter by Exhibition
          </label>
          <select
            id="ticket-exhibition-filter"
            className="input"
            value={exhibition}
            onChange={(e) => setExhibition(e.target.value)}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Exhibitions</option>
            {exhibitions.map((item) => (
              <option key={item.ExhibitionID} value={String(item.ExhibitionID)}>
                {item.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table
          className={
            'data-table' + (selectedTickets.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum ticket sales</caption>
          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Ticket</th>
              <th scope="col">Exhibition</th>
              <th scope="col">Type</th>
              <th scope="col">Price</th>
              <th scope="col">Sale Date</th>
              <th scope="col">Membership</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ticket) => {
              const member = memberships.find(
                (item) =>
                  Number(item.MembershipID) === Number(ticket.MembershipID)
              )

              return (
                <tr
                  key={ticket.TicketID}
                  className={isSelected(ticket.TicketID) ? 'selected-row' : ''}
                >
                  {allowEdit && (
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={isSelected(ticket.TicketID)}
                        onChange={() => toggle(ticket.TicketID)}
                        aria-label={`Select ticket ${ticket.TicketID}`}
                      />
                    </td>
                  )}

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

                  <td className="mono">
                    {ticket.SaleDate ? ticket.SaleDate.split('T')[0] : '-'}
                  </td>

                  <td>
                    {member ? (
                      <span className="chip chip-primary">{member.Name}</span>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 7 : 6} className="empty">
                  No tickets found matching this filter.
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
                <option key={item.ExhibitionID} value={item.ExhibitionID}>
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
                <option key={member.MembershipID} value={member.MembershipID}>
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