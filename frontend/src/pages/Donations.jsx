import { useState, useEffect } from 'react'
import { Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Check',
  'Bank Transfer',
]

const emptyForm = {
  FirstName: '',
  LastName: '',
  AmountDonated: '',
  PaymentMethod: '',
  DonationDate: '',
}

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

function Donations() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/donations')
  const today = new Date().toISOString().split('T')[0]

  const [donations, setDonations] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await callApi('/api/donations', 'GET')

        setDonations(
          data.map((donation) => ({
            ...donation,
            AmountDonated: Number(donation.AmountDonated),
          }))
        )
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load donations: ' + err.message)
      }
    }

    loadDonations()
  }, [reloadCount])

  const refetchDonations = () => {
    setReloadCount((count) => count + 1)
  }

  const totalAmount = donations.reduce(
    (sum, donation) => sum + donation.AmountDonated,
    0
  )

  const averageDonation =
    donations.length > 0 ? totalAmount / donations.length : 0

  const filteredDonations = donations.filter((donation) => {
    const text =
      `${donation.DonationID} ${donation.FirstName} ${donation.LastName} ${donation.PaymentMethod}`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({ ...emptyForm })
    setEditingId(null)
  }

  const closeModal = () => {
    resetForm()
    setOpen(false)
  }

  const openAddModal = () => {
    resetForm()
    setFormData({ ...emptyForm, DonationDate: today })
    setOpen(true)
  }

  const openEditModal = (donation) => {
    setEditingId(donation.DonationID)
    setFormData({
      FirstName: donation.FirstName,
      LastName: donation.LastName,
      AmountDonated: String(donation.AmountDonated),
      PaymentMethod: donation.PaymentMethod,
      DonationDate: donation.DonationDate || '',
    })
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const firstName = formData.FirstName.trim()
    const lastName = formData.LastName.trim()
    const amount = Number(formData.AmountDonated)

    if (!namePattern.test(firstName)) {
      alert(
        'First Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!namePattern.test(lastName)) {
      alert(
        'Last Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Amount must be greater than 0.')
      return
    }

    if (amount > 999999.99) {
      alert('Amount cannot be more than $999,999.99.')
      return
    }

    if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
      alert('Amount can have no more than two decimal places.')
      return
    }

    if (!paymentMethods.includes(formData.PaymentMethod)) {
      alert('Please select a valid payment method.')
      return
    }

    if (!formData.DonationDate || formData.DonationDate > today) {
      alert('Please select a valid Donation Date that is not in the future.')
      return
    }

    const donationData = {
      FirstName: firstName,
      LastName: lastName,
      AmountDonated: amount,
      PaymentMethod: formData.PaymentMethod,
      DonationDate: formData.DonationDate,
    }

    try {
      if (editingId === null) {
        await callApi('/api/donations', 'POST', donationData)
      } else {
        await callApi('/api/donations/' + editingId, 'PUT', donationData)
      }
    } catch (err) {
      alert(err.message)
      return
    }

    closeModal()
    clear()
    refetchDonations()
  }

  const {
    selectedRows: selectedDonations,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filteredDonations, (donation) => donation.DonationID)

  const handleEditSelected = () => {
    openEditModal(selectedDonations[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'donation',
      (donation) => `Donation ${donation.DonationID}`,
      (donation) =>
        callApi('/api/donations/' + donation.DonationID, 'DELETE')
    )

    if (deleted) refetchDonations()
  }

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donations</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedDonations.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Donation
            </button>
          </div>
        )}
      </div>

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">{donations.length}</div>
          <div className="summary-label">Total Donations</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            ${totalAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="summary-label">Total Amount</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            ${averageDonation.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="summary-label">Average Donation</div>
        </Panel>
      </div>

      <div className="toolbar">
        <label htmlFor="donation-search" className="sr-only">
          Search donations
        </label>
        <input
          id="donation-search"
          name="donationSearch"
          type="search"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donations..."
        />
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table
          className={
            'data-table' + (selectedDonations.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum donations</caption>
          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Donation ID</th>
              <th scope="col">Donor</th>
              <th scope="col">Amount</th>
              <th scope="col">Date</th>
              <th scope="col">Payment Method</th>
            </tr>
          </thead>

          <tbody>
            {filteredDonations.map((donation) => (
              <tr
                key={donation.DonationID}
                className={
                  isSelected(donation.DonationID) ? 'selected-row' : ''
                }
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(donation.DonationID)}
                      onChange={() => toggle(donation.DonationID)}
                      aria-label={`Select donation ${donation.DonationID}`}
                    />
                  </td>
                )}

                <td className="mono">
                  #{String(donation.DonationID).padStart(5, '0')}
                </td>
                <td className="strong">
                  {donation.FirstName} {donation.LastName}
                </td>
                <td className="mono">
                  ${donation.AmountDonated.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="mono">{donation.DonationDate}</td>
                <td className="muted">{donation.PaymentMethod}</td>
              </tr>
            ))}

            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 6 : 5} className="empty">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Donation' : 'Edit Donation'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="donation-first-name">First Name</label>
            <input
              id="donation-first-name"
              name="FirstName"
              type="text"
              autoComplete="given-name"
              value={formData.FirstName}
              onChange={handleChange}
              maxLength={100}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-last-name">Last Name</label>
            <input
              id="donation-last-name"
              name="LastName"
              type="text"
              autoComplete="family-name"
              value={formData.LastName}
              onChange={handleChange}
              maxLength={100}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-amount">Amount ($)</label>
            <input
              id="donation-amount"
              name="AmountDonated"
              type="number"
              min="0.01"
              max="999999.99"
              step="0.01"
              inputMode="decimal"
              value={formData.AmountDonated}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-date">Donation Date</label>
            <input
              id="donation-date"
              name="DonationDate"
              type="date"
              max={today}
              value={formData.DonationDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-payment-method">Payment Method</label>
            <select
              id="donation-payment-method"
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

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {editingId === null ? 'Add Donation' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Donations
