
import { useState } from 'react'

const INITIAL_DONATIONS = [
  { id: 'DON-901', donor: 'Eleanor Vance', amount: 250000.00, fund: 'Acquisition Fund', date: '2026-10-02', paymentMethod: 'Wire Transfer' },
  { id: 'DON-902', donor: 'The Houston Arts Foundation', amount: 1000000.00, fund: 'Capital Campaign', date: '2026-09-28', paymentMethod: 'Check' },
  { id: 'DON-903', donor: 'Dr. Marcus Holloway', amount: 50000.00, fund: 'Education & Outreach', date: '2026-09-15', paymentMethod: 'Credit Card' },
  { id: 'DON-904', donor: 'Anonymous', amount: 15000.00, fund: 'General Operating', date: '2026-09-10', paymentMethod: 'Stock Transfer' },
  { id: 'DON-905', donor: 'Sarah & David Chen', amount: 75000.00, fund: 'Exhibition Sponsorship', date: '2026-08-22', paymentMethod: 'Credit Card' },
]

export default function Donations() {
  const [donations, setDonations] = useState(INITIAL_DONATIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    donor: '',
    amount: '',
    fund: 'General Operating',
    paymentMethod: 'Credit Card',
  })

  const filteredDonations = donations.filter((item) =>
    item.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fund.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalDonationsSum = donations.reduce(
    (sum, item) => sum + item.amount,
    0
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.donor.trim() || !formData.amount) return

    const amount = Number(formData.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a donation amount greater than zero.')
      return
    }

    const newDonation = {
      id: `DON-${Math.floor(100 + Math.random() * 900)}`,
      donor: formData.donor.trim(),
      amount,
      fund: formData.fund,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: formData.paymentMethod,
    }

    setDonations((previousDonations) => [newDonation, ...previousDonations])
    setFormData({
      donor: '',
      amount: '',
      fund: 'General Operating',
      paymentMethod: 'Credit Card',
    })
    setIsModalOpen(false)
  }

  return (
    <div className="page">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="page-title">Donations</h1>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
        >
          Record Donation
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <label htmlFor="donation-search" className="sr-only">
          Search donations by donor, fund, or donation ID
        </label>
        <input
          id="donation-search"
          name="donationSearch"
          type="search"
          placeholder="Search donor, fund, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid var(--border, #ccc)',
            width: '280px',
            maxWidth: '100%',
            fontSize: '14px',
          }}
        />

        <div style={{ fontSize: '14px', color: '#444', fontWeight: '500' }}>
          Total Recorded:{' '}
          <span style={{ color: '#12315a', fontWeight: '600' }}>
            ${totalDonationsSum.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
          }}
        >
          <caption className="sr-only">Recorded museum donations</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border, #eee)', color: '#666' }}>
              <th scope="col" style={{ padding: '12px 16px' }}>DONATION ID</th>
              <th scope="col" style={{ padding: '12px 16px' }}>DONOR</th>
              <th scope="col" style={{ padding: '12px 16px' }}>FUND</th>
              <th scope="col" style={{ padding: '12px 16px' }}>AMOUNT</th>
              <th scope="col" style={{ padding: '12px 16px' }}>PAYMENT METHOD</th>
              <th scope="col" style={{ padding: '12px 16px' }}>DATE</th>
            </tr>
          </thead>

          <tbody>
            {filteredDonations.length > 0 ? (
              filteredDonations.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border, #f4f4f4)' }}
                >
                  <td style={{ padding: '12px 16px', color: '#888' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                    {item.donor}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{item.fund}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#137333' }}>
                    ${item.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {item.paymentMethod}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>
                    {item.date}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: '32px', textAlign: 'center', color: '#888' }}
                >
                  No donations found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
            }
          }}
        >
          <div
            className="modal-content card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
            style={{
              width: '420px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: '#fff',
            }}
          >
            <h2
              id="donation-modal-title"
              style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}
            >
              Record New Donation
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label
                  htmlFor="donation-donor"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Donor Name / Organization
                </label>
                <input
                  id="donation-donor"
                  name="donor"
                  type="text"
                  autoComplete="off"
                  required
                  maxLength={200}
                  placeholder="e.g., Jane Doe or Anonymous"
                  value={formData.donor}
                  onChange={(e) =>
                    setFormData({ ...formData, donor: e.target.value })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  htmlFor="donation-amount"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Donation Amount ($)
                </label>
                <input
                  id="donation-amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  htmlFor="donation-fund"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Fund Allocation
                </label>
                <select
                  id="donation-fund"
                  name="fund"
                  value={formData.fund}
                  onChange={(e) =>
                    setFormData({ ...formData, fund: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="General Operating">General Operating</option>
                  <option value="Acquisition Fund">Acquisition Fund</option>
                  <option value="Capital Campaign">Capital Campaign</option>
                  <option value="Education & Outreach">Education & Outreach</option>
                  <option value="Exhibition Sponsorship">Exhibition Sponsorship</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="donation-payment-method"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Payment Method
                </label>
                <select
                  id="donation-payment-method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
