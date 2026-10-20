import { useState } from 'react'
import { Panel, Modal, SelectionActions } from '../components/ui'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

const initialDonations = [
  {
    id: 'DON-901',
    donor: 'Eleanor Vance',
    amount: 250000,
    fund: 'Acquisition Fund',
    date: '2026-10-02',
    paymentMethod: 'Wire Transfer',
  },
  {
    id: 'DON-902',
    donor: 'The Houston Arts Foundation',
    amount: 1000000,
    fund: 'Capital Campaign',
    date: '2026-09-28',
    paymentMethod: 'Check',
  },
  {
    id: 'DON-903',
    donor: 'Dr. Marcus Holloway',
    amount: 50000,
    fund: 'Education & Outreach',
    date: '2026-09-15',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'DON-904',
    donor: 'Anonymous',
    amount: 15000,
    fund: 'General Operating',
    date: '2026-09-10',
    paymentMethod: 'Stock Transfer',
  },
  {
    id: 'DON-905',
    donor: 'Sarah & David Chen',
    amount: 75000,
    fund: 'Exhibition Sponsorship',
    date: '2026-08-22',
    paymentMethod: 'Credit Card',
  },
]

const funds = [
  'General Operating',
  'Acquisition Fund',
  'Capital Campaign',
  'Education & Outreach',
  'Exhibition Sponsorship',
]

const paymentMethods = [
  'Wire Transfer',
  'Check',
  'Credit Card',
  'Stock Transfer',
]

const emptyForm = {
  donor: '',
  amount: '',
  fund: '',
  paymentMethod: '',
}

const donorPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9'&., -]+$/

function Donations() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/donations')

  const [donations, setDonations] = useState(initialDonations)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const totalAmount = donations.reduce(
    (sum, donation) => sum + Number(donation.amount),
    0
  )

  const averageDonation =
    donations.length > 0 ? totalAmount / donations.length : 0

  const filteredDonations = donations.filter((donation) => {
    const text =
      `${donation.id} ${donation.donor} ${donation.fund} ${donation.paymentMethod}`.toLowerCase()

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
    setOpen(true)
  }

  const openEditModal = (donation) => {
    setEditingId(donation.id)
    setFormData({
      donor: donation.donor,
      amount: String(donation.amount),
      fund: donation.fund,
      paymentMethod: donation.paymentMethod,
    })
    setOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const donor = formData.donor.trim()
    const amount = Number(formData.amount)

    if (!donor || !formData.amount || !formData.fund || !formData.paymentMethod) {
      alert('Please complete all required fields.')
      return
    }

    if (!donorPattern.test(donor)) {
      alert(
        'Donor name can contain letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands only.'
      )
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Amount must be greater than 0.')
      return
    }

    if (Math.round(amount * 100) !== amount * 100) {
      alert('Amount can have no more than two decimal places.')
      return
    }

    if (!funds.includes(formData.fund)) {
      alert('Please select a valid fund.')
      return
    }

    if (!paymentMethods.includes(formData.paymentMethod)) {
      alert('Please select a valid payment method.')
      return
    }

    const donationData = {
      donor,
      amount,
      fund: formData.fund,
      paymentMethod: formData.paymentMethod,
    }

    if (editingId !== null) {
      setDonations((currentDonations) =>
        currentDonations.map((donation) =>
          donation.id === editingId
            ? { ...donation, ...donationData }
            : donation
        )
      )
    } else {
      const nextNumber =
        Math.max(
          900,
          ...donations.map((donation) =>
            Number(donation.id.replace('DON-', ''))
          )
        ) + 1

      const newDonation = {
        id: `DON-${nextNumber}`,
        ...donationData,
        date: new Date().toISOString().split('T')[0],
      }

      setDonations((currentDonations) => [
        newDonation,
        ...currentDonations,
      ])
    }

    closeModal()
    clear()
  }

  const {
    selectedRows: selectedDonations,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filteredDonations, (donation) => donation.id)

  const handleEditSelected = () => {
    openEditModal(selectedDonations[0])
  }

  const handleDeleteSelected = async () => {
    await deleteSelected(
      'donation',
      (donation) => donation.id,
      async (donation) => {
        setDonations((currentDonations) =>
          currentDonations.filter((item) => item.id !== donation.id)
        )
      }
    )
  }

  return (
    <div className="page">
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
            ${totalAmount.toLocaleString('en-US')}
          </div>
          <div className="summary-label">Total Amount</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            ${averageDonation.toLocaleString('en-US', {
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donations..."
        />
      </div>

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
              <th scope="col">Fund</th>
              <th scope="col">Date</th>
              <th scope="col">Payment Method</th>
            </tr>
          </thead>

          <tbody>
            {filteredDonations.map((donation) => (
              <tr
                key={donation.id}
                className={isSelected(donation.id) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(donation.id)}
                      onChange={() => toggle(donation.id)}
                      aria-label={`Select donation ${donation.id}`}
                    />
                  </td>
                )}

                <td className="mono">{donation.id}</td>
                <td className="strong">{donation.donor}</td>
                <td className="mono">
                  ${Number(donation.amount).toLocaleString('en-US')}
                </td>
                <td>{donation.fund}</td>
                <td className="mono">{donation.date}</td>
                <td className="muted">{donation.paymentMethod}</td>
              </tr>
            ))}

            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 7 : 6} className="empty">
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
            <label htmlFor="donation-donor">Donor</label>
            <input
              id="donation-donor"
              name="donor"
              type="text"
              autoComplete="name"
              value={formData.donor}
              onChange={handleChange}
              maxLength={150}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ0-9'&amp;., -]+"
              title="Use letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-amount">Amount ($)</label>
            <input
              id="donation-amount"
              name="amount"
              type="number"
              min="0.01"
              max="1000000000"
              step="0.01"
              inputMode="decimal"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donation-fund">Fund</label>
            <select
              id="donation-fund"
              name="fund"
              value={formData.fund}
              onChange={handleChange}
              required
            >
              <option value="">Select Fund</option>
              {funds.map((fund) => (
                <option key={fund} value={fund}>
                  {fund}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="donation-payment-method">Payment Method</label>
            <select
              id="donation-payment-method"
              name="paymentMethod"
              value={formData.paymentMethod}
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
