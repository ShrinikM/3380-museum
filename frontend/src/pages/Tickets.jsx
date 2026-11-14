import { useState, useEffect } from 'react'
import { Badge, Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'
import { TablePager, usePagedList } from '../components/TablePager'

const defaultTicketTypes = ['Adult', 'Senior', 'Student', 'Child']

const emptyForm = {
  ExhibitionID: '',
  TicketType: '',
  Price: '',
  SaleDate: '',
  VisitDate: '',
  PaymentMethod: '',
  MembershipID: '',
}

function getMemberDiscount(member, ticketType, membershipLimits) {
  if (!member || !ticketType) {
    return 0
  }

  const limits = membershipLimits[member.MembershipType] || {}

  if (!limits[ticketType]) {
    return 0
  }

  return Number(member.DiscountPercent) || 0
}

function getPrice(ticketPrices, ticketType, discount) {
  const basePrice = ticketPrices[ticketType] || 0

  return (basePrice * (1 - discount / 100)).toFixed(2)
}

function Tickets() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/tickets')
  const today = new Date().toISOString().split('T')[0]

  const [tickets, setTickets] = useState([])
  const [refunds, setRefunds] = useState([])
  const [waitlists, setWaitlists] = useState([])
  const [exhibitions, setExhibitions] = useState([])
  const [ticketPrices, setTicketPrices] = useState({})
  const [membershipLimits, setMembershipLimits] = useState({})
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [exhibition, setExhibition] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [lookupText, setLookupText] = useState('')
  const [lookupMessage, setLookupMessage] = useState('')
  const [member, setMember] = useState(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionSaving, setActionSaving] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const ticketTypes = Object.keys(ticketPrices).length > 0
    ? Object.keys(ticketPrices)
    : defaultTicketTypes

  useEffect(() => {
    async function loadData() {
      try {
        const [
          ticketsData,
          exhibitionsData,
          refundsData,
          waitlistData,
          pricesData,
          plansData,
          paymentData,
        ] = await Promise.all([
          callApi('/api/tickets', 'GET'),
          callApi('/api/exhibitions', 'GET'),
          callApi('/api/tickets/refunds', 'GET'),
          callApi('/api/tickets/waitlist', 'GET'),
          callApi('/api/ticket-prices', 'GET'),
          callApi('/api/membership-prices', 'GET'),
          callApi('/api/payment-methods?for=ticket', 'GET'),
        ])

        setTickets(
          ticketsData.map((ticket) => ({
            ...ticket,
            Price: Number(ticket.Price),
          }))
        )

        setExhibitions(exhibitionsData)
        setRefunds(refundsData)
        setWaitlists(waitlistData)
        setTicketPrices(pricesData)
        setMembershipLimits(
          Object.fromEntries(
            plansData.map((plan) => [plan.MembershipType, plan.TicketLimits || {}])
          )
        )
        setPaymentMethods(paymentData)
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

  const soldTickets = tickets.filter(
    (ticket) => ticket.RefundStatus !== 'Refunded'
  )

  const revenue = soldTickets.reduce((sum, ticket) => sum + ticket.Price, 0)

  const memberTickets = soldTickets.filter(
    (ticket) => ticket.MembershipID !== null
  ).length

  const handleNotify = (item) => {
    setActionError('')
    setPendingAction({ type: 'notify', item: item })
  }

  const handleRefund = (item) => {
    setActionError('')
    setPendingAction({ type: 'refund', item: item })
  }

  const confirmAction = async () => {
    const { type, item } = pendingAction

    setActionSaving(true)
    setActionError('')

    try {
      await callApi(`/api/tickets/exhibition/${item.ExhibitionID}/${type}`, 'POST')
      setPendingAction(null)
      refetchTickets()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionSaving(false)
    }
  }


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

  const { visibleRows, page, total, setPage } = usePagedList(
    filtered,
    search + '|' + type + '|' + exhibition
  )
  const pagedRefunds = usePagedList(refunds)
  const pagedWaitlists = usePagedList(waitlists)

  const usedMemberDiscounts = (found, type, visitDate, exhibitionId) => {
    if (!found || !type || !visitDate || !exhibitionId) {
      return 0
    }

    return tickets.filter((ticket) =>
      Number(ticket.MembershipID) === Number(found.MembershipID) &&
      ticket.VisitDate === visitDate &&
      Number(ticket.ExhibitionID) === Number(exhibitionId) &&
      ticket.TicketType === type &&
      ticket.TicketID !== editingId &&
      ticket.RefundStatus !== 'Refunded' &&
      Number(ticket.Price) < Number(ticketPrices[type])
    ).length
  }

  const priceFor = (found, type, visitDate, exhibitionId = formData.ExhibitionID) => {
    if (!type) {
      return ''
    }

    const limits = membershipLimits[found?.MembershipType] || {}
    const discount =
      usedMemberDiscounts(found, type, visitDate, exhibitionId) < (limits[type] || 0)
        ? getMemberDiscount(found, type, membershipLimits)
        : 0

    return getPrice(ticketPrices, type, discount)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'VisitDate'
        ? { Price: priceFor(member, formData.TicketType, value, formData.ExhibitionID) }
        : {}),
      ...(name === 'ExhibitionID'
        ? { Price: priceFor(member, formData.TicketType, formData.VisitDate, value) }
        : {}),
    })
  }

  const handleTypeChange = (e) => {
    const value = e.target.value

    setFormData({
      ...formData,
      TicketType: value,
      Price: priceFor(member, value, formData.VisitDate),
    })
  }

  const handleLookup = async () => {
    if (!lookupText.trim()) {
      setLookupMessage('Enter an email or phone number.')
      return
    }

    try {
      const found = await callApi(
        '/api/memberships/lookup?q=' + encodeURIComponent(lookupText.trim()),
        'GET'
      )

      if (found.Status === 'expired') {
        setLookupMessage(found.Name + ' - membership expired on ' + found.EndDate)
        return
      }

      if (found.Status === 'cancelled') {
        setLookupMessage(found.Name + ' - membership was cancelled')
        return
      }

      if (found.Status === 'upcoming') {
        setLookupMessage(found.Name + ' - membership starts on ' + found.StartDate)
        return
      }

      if (
        found.MembershipType === 'Senior' &&
        formData.TicketType === 'Student'
      ) {
        setLookupMessage(
          found.Name +
            ' has a Senior membership. Student tickets are not available.'
        )
        return
      }

      setMember(found)
      setLookupMessage('')
      setFormData({
        ...formData,
        MembershipID: String(found.MembershipID),
        Price: priceFor(found, formData.TicketType, formData.VisitDate),
      })
    } catch (err) {
      setLookupMessage(err.message)
    }
  }

  const removeMember = () => {
    setMember(null)
    setLookupText('')
    setLookupMessage('')
    setFormData({
      ...formData,
      MembershipID: '',
      Price: formData.TicketType
        ? getPrice(ticketPrices, formData.TicketType, 0)
        : '',
    })
  }

  const resetForm = () => {
    setFormError('')
    setFormData(emptyForm)
    setLookupText('')
    setLookupMessage('')
    setMember(null)
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
      VisitDate: ticket.VisitDate || '',
      PaymentMethod: ticket.PaymentMethod || '',
      MembershipID: ticket.MembershipID ? String(ticket.MembershipID) : '',
    })

    setLookupText('')
    setLookupMessage('')
    setMember(
      ticket.MembershipID
        ? {
            MembershipID: ticket.MembershipID,
            Name: ticket.MembershipName,
            MembershipType: ticket.MembershipType || null,
            DiscountPercent: ticket.MemberDiscount,
          }
        : null
    )

    setOpen(true)
  }

  const closeModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(false)
  }

  const formExhibition = exhibitions.find(
    (item) => Number(item.ExhibitionID) === Number(formData.ExhibitionID)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.ExhibitionID) {
      setFormError('Please select an Exhibition.')
      return
    }

    if (!ticketTypes.includes(formData.TicketType)) {
      setFormError('Please select a valid Ticket Type.')
      return
    }

    if (
      member?.MembershipType === 'Senior' &&
      formData.TicketType === 'Student'
    ) {
      setFormError('Student tickets are not available with a Senior membership.')
      return
    }

    if (!formData.SaleDate || formData.SaleDate > today) {
      setFormError('Please select a valid Sale Date that is not in the future.')
      return
    }

    const selectedExhibition = exhibitions.find(
      (item) => Number(item.ExhibitionID) === Number(formData.ExhibitionID)
    )

    if (!selectedExhibition) {
      setFormError('Please select a valid Exhibition.')
      return
    }

    if (!formData.VisitDate) {
      setFormError('Please select a Visit Date.')
      return
    }

    if (
      formData.VisitDate < selectedExhibition.StartDate ||
      formData.VisitDate > selectedExhibition.EndDate
    ) {
      setFormError('Visit Date must be within the exhibition dates.')
      return
    }

    if (formData.VisitDate < formData.SaleDate) {
      setFormError('Visit Date cannot be before the Sale Date.')
      return
    }

    if (!paymentMethods.includes(formData.PaymentMethod)) {
      setFormError('Please select a payment method.')
      return
    }

    const price = Number(formData.Price)

    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Ticket price must be greater than 0.')
      return
    }

    const ticketData = {
      ExhibitionID: Number(formData.ExhibitionID),
      TicketType: formData.TicketType,
      SaleDate: formData.SaleDate,
      VisitDate: formData.VisitDate,
      PaymentMethod: formData.PaymentMethod,
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
      setFormError(err.message)
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
  } = useSelection(filtered, (ticket) => ticket.TicketID)

  const handleEditSelected = () => {
    openEditModal(selectedTickets[0])
  }

  const handleDeleteSelected = () => {
    if (selectedTickets.length === 0) return
    setTicketToDelete(selectedTickets[0])
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return

    setDeleting(true)
    try {
      await callApi('/api/tickets/' + ticketToDelete.TicketID, 'DELETE')
      setDeleteModalOpen(false)
      setTicketToDelete(null)
      clear()
      refetchTickets()
    } catch (err) {
      setDeleteError('Could not delete ticket: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page page-wide">
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
            {soldTickets.length.toLocaleString()}
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
            ${(soldTickets.length ? revenue / soldTickets.length : 0).toFixed(2)}
          </div>
          <div className="summary-label">Avg. Ticket Price</div>
        </Panel>
      </div>

      {refunds.length > 0 && (
        <div className="card table-wrap section-gap-sm">
          <h2 style={{ fontSize: '16px', margin: '16px 16px 4px' }}>
            Cancelled exhibitions
          </h2>

          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Exhibition</th>
                <th scope="col">Reason</th>
                <th scope="col">To Notify</th>
                <th scope="col">Refunds Pending</th>
                <th scope="col">Refund Total</th>
                {allowEdit && <th scope="col">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {pagedRefunds.visibleRows.map((item) => (
                <tr key={item.ExhibitionID}>
                  <td>
                    <div className="strong">{item.ExhibitionName}</div>
                    <div className="cell-sub">Cancelled {item.CancelledAt}</div>
                  </td>
                  <td>{item.CancellationReason || '-'}</td>
                  <td>{item.PendingNotices}</td>
                  <td>{item.PendingRefunds}</td>
                  <td className="mono">${item.RefundTotal.toFixed(2)}</td>
                  {allowEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => handleNotify(item)}
                          disabled={item.PendingNotices === 0}
                        >
                          Notify Visitors
                        </button>

                        <button
                          type="button"
                          className="btn primary"
                          onClick={() => handleRefund(item)}
                          disabled={item.PendingRefunds === 0}
                        >
                          Mark Refunded
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {refunds.length > 0 && (
        <TablePager
          page={pagedRefunds.page}
          total={pagedRefunds.total}
          onChange={pagedRefunds.setPage}
        />
      )}

      {waitlists.length > 0 && (
        <div className="card table-wrap section-gap-sm">
          <h2 style={{ fontSize: '16px', margin: '16px 16px 4px' }}>
            Waitlists
          </h2>

          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Exhibition</th>
                <th scope="col">Waiting</th>
                <th scope="col">Spot Opened</th>
              </tr>
            </thead>

            <tbody>
              {pagedWaitlists.visibleRows.map((item) => (
                <tr key={item.ExhibitionID}>
                  <td className="strong">{item.ExhibitionName}</td>
                  <td>{item.Waiting}</td>
                  <td>{item.Notified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {waitlists.length > 0 && (
        <TablePager
          page={pagedWaitlists.page}
          total={pagedWaitlists.total}
          onChange={pagedWaitlists.setPage}
        />
      )}

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
              <th scope="col">Customer</th>
              <th scope="col" className="center-cell">Membership</th>
              <th scope="col" className="center-cell">Refund</th>
              <th scope="col" className="center-cell">Notice</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((ticket) => {
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

                  <td className="mono">
                    ${ticket.Price.toFixed(2)}
                    {ticket.PaymentMethod && (
                      <div className="cell-sub">{ticket.PaymentMethod}</div>
                    )}
                  </td>

                  <td className="mono">
                    {ticket.SaleDate ? ticket.SaleDate.split('T')[0] : '-'}
                    {ticket.VisitDate && (
                      <div className="cell-sub">Visit {ticket.VisitDate}</div>
                    )}
                  </td>

                  <td>
                    {ticket.CustomerName ? (
                      <>
                        <div className="strong">{ticket.CustomerName}</div>
                        <div className="cell-sub">{ticket.CustomerEmail}</div>
                      </>
                    ) : (
                      <span className="cell-sub">Walk-in</span>
                    )}
                  </td>

                  <td className="center-cell">
                    {ticket.MembershipName ? (
                      <span className="chip chip-primary">
                        {ticket.MembershipName}
                      </span>
                    ) : (
                      <span
                        className="status-dot is-off"
                        role="img"
                        aria-label="No membership"
                        title="No membership"
                      />
                    )}
                  </td>

                  <td className="center-cell">
                    {ticket.RefundStatus === 'None' ? (
                      <span
                        className="status-dot is-off"
                        role="img"
                        aria-label="No refund"
                        title="No refund"
                      />
                    ) : (
                      <span
                        className="status-dot is-on"
                        role="img"
                        aria-label={ticket.RefundStatus}
                        title={ticket.RefundStatus}
                      />
                    )}
                  </td>

                  <td className="center-cell">
                    {ticket.NotificationStatus === 'None' ? (
                      <span
                        className="status-dot is-off"
                        role="img"
                        aria-label="No notice"
                        title="No notice"
                      />
                    ) : (
                      <span
                        className="status-dot is-on"
                        role="img"
                        aria-label={ticket.NotificationStatus}
                        title={ticket.NotificationStatus}
                      />
                    )}
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 10 : 9} className="empty">
                  No tickets found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePager page={page} total={total} onChange={setPage} />

      <Modal
        open={open}
        title={editingId !== null ? 'Edit Ticket' : 'Add Ticket'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          {formError && (
            <p className="form-error form-full" role="alert">
              {formError}
            </p>
          )}

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
              {exhibitions
                .filter(
                  (item) =>
                    item.Status === 'active' ||
                    item.Status === 'upcoming' ||
                    String(item.ExhibitionID) === formData.ExhibitionID
                )
                .map((item) => (
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
            <label htmlFor="ticket-visit-date">Visit Date</label>
            <input
              id="ticket-visit-date"
              name="VisitDate"
              type="date"
              value={formData.VisitDate}
              onChange={handleChange}
              min={formExhibition?.StartDate}
              max={formExhibition?.EndDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-payment">Payment Method</label>
            <select
              id="ticket-payment"
              name="PaymentMethod"
              value={formData.PaymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group form-full">
            <label htmlFor="ticket-member-lookup">
              Member Email or Phone
            </label>

            {member === null && (
              <div className="lookup-row">
                <input
                  id="ticket-member-lookup"
                  type="text"
                  value={lookupText}
                  onChange={(e) => setLookupText(e.target.value)}
                />

                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleLookup}
                >
                  Find
                </button>
              </div>
            )}

            {member !== null && (
              <div className="lookup-row">
                <span className="chip chip-primary">
                  {member.Name}
                  {member.DiscountPercent !== null
                    ? ' - ' + member.DiscountPercent + '% off'
                    : ''}
                </span>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={removeMember}
                >
                  Remove
                </button>
              </div>
            )}

            {lookupMessage && (
              <p className="lookup-message">{lookupMessage}</p>
            )}
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

      <Modal
        open={deleteModalOpen}
        title="Delete Ticket"
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="form-grid">
          {deleteError && (
            <p className="form-error form-full" role="alert">
              {deleteError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            Are you sure you want to delete ticket <strong>#{String(ticketToDelete?.TicketID || '').padStart(5, '0')}</strong>? This action cannot be undone.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Ticket'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={pendingAction !== null}
        title={pendingAction?.type === 'refund' ? 'Refund Tickets' : 'Notify Visitors'}
        onClose={() => setPendingAction(null)}
      >
        <div className="form-grid">
          {actionError && (
            <p className="form-error form-full" role="alert">
              {actionError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            {pendingAction?.type === 'refund'
              ? <>Refund <strong>{pendingAction.item.PendingRefunds}</strong> tickets (${pendingAction.item.RefundTotal.toFixed(2)}) for <strong>{pendingAction.item.ExhibitionName}</strong>?</>
              : <>Notify <strong>{pendingAction?.item.PendingNotices}</strong> visitors that <strong>{pendingAction?.item.ExhibitionName}</strong> was cancelled?</>}
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setPendingAction(null)}
              disabled={actionSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={confirmAction}
              disabled={actionSaving}
            >
              {actionSaving
                ? 'Working...'
                : pendingAction?.type === 'refund' ? 'Refund Tickets' : 'Notify Visitors'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Tickets