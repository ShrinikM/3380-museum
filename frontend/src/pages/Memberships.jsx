import { useState, useEffect } from 'react'
import { Badge, Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

const membershipTypes = ['Individual', 'Family', 'Student', 'Senior']

const membershipPrices = {
  Individual: 75,
  Family: 150,
  Student: 40,
  Senior: 60,
}

const membershipDiscounts = {
  Individual: 5,
  Family: 10,
  Student: 10,
  Senior: 15,
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  type: '',
  startDate: '',
  endDate: '',
  price: '',
  discount: '',
  payment: '',
}

function Memberships() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/memberships')

  const [memberships, setMemberships] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All') 
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    async function loadMemberships() {
      try {
        const data = await callApi('/api/memberships', 'GET')

        setMemberships(
          data.map((member) => ({
            id: Number(member.MembershipID),
            firstName: member.FirstName,
            lastName: member.LastName,
            email: member.Email,
            phone: member.Phone || '',
            type: member.MembershipType,
            startDate: member.StartDate
              ? member.StartDate.split('T')[0]
              : '',
            endDate: member.EndDate
              ? member.EndDate.split('T')[0]
              : '',
            price: Number(member.Price),
            discount: Number(member.DiscountPercent),
            payment: member.PaymentMethod,
            status: member.Status,
          }))
        )

        setLoadError('')
      } catch (err) {
        setLoadError('Could not load memberships: ' + err.message)
      }
    }

    loadMemberships()
  }, [reloadCount])

  const refetchMemberships = () => {
    setReloadCount((count) => count + 1)
  }

  const maxEndDate = formData.startDate
    ? new Date(
        new Date(formData.startDate).setFullYear(
          new Date(formData.startDate).getFullYear() + 1
        )
      )
        .toISOString()
        .split('T')[0]
    : undefined

  const active = memberships.filter(
    (member) => member.status === 'active'
  )
  const upcoming = memberships.filter(
    (member) => member.status === 'upcoming'
  )
  const expired = memberships.filter(
    (member) => member.status === 'expired' || member.status === 'cancelled'
  )

  const revenue = memberships.reduce(
    (sum, member) => sum + member.price,
    0
  )

  
  const filtered = memberships.filter((member) => {
    const name = `${member.firstName} ${member.lastName}`.toLowerCase()
    const searchText = search.toLowerCase()

    const matchesSearch =
      name.includes(searchText) || member.email.toLowerCase().includes(searchText)

    const matchesType =
      selectedType === 'All' || member.type === selectedType

    return matchesSearch && matchesType
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'type') {
      setFormData({
        ...formData,
        type: value,
        price: value ? membershipPrices[value] : '',
        discount: value ? membershipDiscounts[value] : '',
      })
      return
    }

    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData(emptyForm)
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (member) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      type: member.type,
      startDate: member.startDate,
      endDate: member.endDate,
      price: String(member.price),
      discount: String(member.discount),
      payment: member.payment,
    })

    setEditingId(member.id)
    setOpen(true)
  }

  const closeModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const firstName = formData.firstName.trim()
    const lastName = formData.lastName.trim()
    const email = formData.email.trim()
    const price = Number(formData.price)
    const discount = Number(formData.discount)

    const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if (!textPattern.test(firstName)) {
      alert('First Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if (!textPattern.test(lastName)) {
      alert('Last Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if (!membershipTypes.includes(formData.type)) {
      alert('Please select a valid membership type.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert('Price must be greater than 0.')
      return
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      alert('Discount must be between 0 and 100.')
      return
    }

    if (!formData.startDate || !formData.endDate) {
      alert('Please select both Start Date and End Date.')
      return
    }

    if (formData.endDate < formData.startDate) {
      alert('End Date cannot be before Start Date.')
      return
    }

    const maxAllowedEndDate = new Date(`${formData.startDate}T00:00:00Z`)
    maxAllowedEndDate.setUTCFullYear(
      maxAllowedEndDate.getUTCFullYear() + 1
    )

    if (new Date(`${formData.endDate}T00:00:00Z`) > maxAllowedEndDate) {
      alert('Membership cannot be longer than 1 year.')
      return
    }

    if (!formData.payment) {
      alert('Please select a payment method.')
      return
    }

    const membershipData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: formData.phone.trim(),
      MembershipType: formData.type,
      StartDate: formData.startDate,
      EndDate: formData.endDate,
      Price: price,
      PaymentMethod: formData.payment,
      DiscountPercent: discount,
    }

    try {
      if (editingId === null) {
        await callApi('/api/memberships', 'POST', membershipData)
      } else {
        await callApi(
          '/api/memberships/' + editingId,
          'PUT',
          membershipData
        )
      }
    } catch (err) {
      alert(err.message)
      return
    }

    closeModal()
    clear()
    refetchMemberships()
  }

  const {
    selectedRows: selectedMemberships,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filtered, (member) => member.id)

  const handleEditSelected = () => {
    openEditModal(selectedMemberships[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'membership',
      (member) => `${member.firstName} ${member.lastName}`,
      (member) => callApi('/api/memberships/' + member.id, 'DELETE')
    )

    if (deleted) refetchMemberships()
  }

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Memberships</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedMemberships.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Membership
            </button>
          </div>
        )}
      </div>

      <div className="grid-4 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">{active.length}</div>
          <div className="summary-label">Active Members</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{upcoming.length}</div>
          <div className="summary-label">Upcoming</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{expired.length}</div>
          <div className="summary-label">Expired / Cancelled</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">${revenue.toFixed(2)}</div>
          <div className="summary-label">Membership Revenue</div>
        </Panel>
      </div>

      <div className="grid-4 section-gap-sm tight">
        {membershipTypes.map((membershipType) => (
          <Panel key={membershipType} className="price-card">
            <div className="price-top">
              <div>
                <div className="stat-label">{membershipType}</div>
                <div className="price-value">
                  ${membershipPrices[membershipType]}
                  <span>/yr</span>
                </div>
              </div>

              <div className="price-count">
                {active.filter(
                  (member) => member.type === membershipType
                ).length}{' '}
                active
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="membership-search" className="sr-only">
            Search memberships
          </label>
          <input
            id="membership-search"
            name="membershipSearch"
            type="search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memberships..."
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="membership-type-filter" className="sr-only">
            Filter by Membership Type
          </label>
          <select
            id="membership-type-filter"
            className="input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
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
            <option value="All">All Types</option>
            {membershipTypes.map((type) => (
              <option key={type} value={type}>
                {type}
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
            'data-table' + (selectedMemberships.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum memberships</caption>
          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Member</th>
              <th scope="col">Type</th>
              <th scope="col">Start Date</th>
              <th scope="col">End Date</th>
              <th scope="col">Price</th>
              <th scope="col">Discount</th>
              <th scope="col">Payment</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((member) => (
              <tr
                key={member.id}
                className={isSelected(member.id) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(member.id)}
                      onChange={() => toggle(member.id)}
                      aria-label={`Select membership for ${member.firstName} ${member.lastName}`}
                    />
                  </td>
                )}

                <td>
                  <div className="strong">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="cell-sub mono">{member.email}</div>
                  {member.phone && (
                    <div className="cell-sub mono">{member.phone}</div>
                  )}
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

                <td>
                  <Badge
                    variant={member.status}
                    label={member.status}
                  />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 9 : 8} className="empty">
                  No memberships found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId !== null ? 'Edit Membership' : 'Add Membership'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="membership-first-name">First Name</label>
            <input
              id="membership-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              maxLength={100}
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-last-name">Last Name</label>
            <input
              id="membership-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              maxLength={100}
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-email">Email</label>
            <input
              id="membership-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={255}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-phone">Phone</label>
            <input
              id="membership-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-type">Type</label>
            <select
              id="membership-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {membershipTypes.map((membershipType) => (
                <option key={membershipType} value={membershipType}>
                  {membershipType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="membership-start-date">Start Date</label>
            <input
              id="membership-start-date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-end-date">End Date</label>
            <input
              id="membership-end-date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || undefined}
              max={maxEndDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-price">Price ($)</label>
            <input
              id="membership-price"
              name="price"
              type="number"
              min="0.01"
              max="999999.99"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-discount">Discount (%)</label>
            <input
              id="membership-discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="membership-payment">Payment</label>
            <select
              id="membership-payment"
              name="payment"
              value={formData.payment}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
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
              {editingId !== null ? 'Save Changes' : 'Add Membership'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Memberships