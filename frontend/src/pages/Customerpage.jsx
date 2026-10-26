import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { callApi } from '../api'
import { Modal } from '../components/ui'
import './Customerpage.css'

const TABS = [
  { id: 'membership', label: 'My Membership' },
  { id: 'tickets', label: 'Buy Tickets' },
  { id: 'shop', label: 'Gift Shop' },
  { id: 'purchases', label: 'Purchases' },
]

const ONLINE_PAYMENTS = ['Credit Card', 'Debit Card', 'Mobile Pay']
const MEMBERSHIP_PAYMENTS = ['Credit Card', 'Debit Card']
const MAX_PER_ORDER = 20
const BLOCKED_STUDENT_MEMBERSHIPS = ['Dual', 'Family', 'Senior']
const COUGARNET_PATTERN = /^[^\s@]+@cougarnet\.uh\.edu$/i

function canBuyStudentTickets(membership) {
  if (membership === null || membership.Status?.toLowerCase() !== 'active') {
    return true
  }

  return !BLOCKED_STUDENT_MEMBERSHIPS.includes(membership.MembershipType)
}

function needsStudentEmail(membership) {
  if (!canBuyStudentTickets(membership)) {
    return false
  }

  return !membership || membership.Status?.toLowerCase() !== 'active' || membership.MembershipType !== 'Student'
}

const STATUS_TEXT = {
  active: 'Active',
  upcoming: 'Starts soon',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

const TICKET_STATUS = {
  None: { label: 'Valid', variant: 'active' },
  Pending: { label: 'Refund pending', variant: 'upcoming' },
  Refunded: { label: 'Refunded', variant: 'completed' },
}

const WAITLIST_STATUS = {
  Waiting: { label: 'Waiting', variant: 'upcoming' },
  Notified: { label: 'Spot opened', variant: 'active' },
  Claimed: { label: 'Ticket bought', variant: 'completed' },
  Cancelled: { label: 'Left waitlist', variant: 'expired' },
}

function waitlistStatus(entry) {
  if (entry.Status === 'Cancelled' && entry.ExhibitionCancelled) {
    return { label: 'Exhibition cancelled', variant: 'cancelled' }
  }

  return WAITLIST_STATUS[entry.Status]
}

function money(value) {
  return `$${Number(value).toFixed(2)}`
}


function formatDate(value) {
  if (!value) {
    return '';
  }

  let year, month, day;

  if (value instanceof Date) {
    year = value.getFullYear();
    month = value.getMonth() + 1;
    day = value.getDate();
  } else {
    const parts = String(value).slice(0, 10).split('-').map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return '';
    }

    [year, month, day] = parts;
  }

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


function Stepper({ value, max, onChange, label }) {
  return (
    <div className="cp-stepper">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`Fewer ${label}`}
      >
        -
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`More ${label}`}
      >
        +
      </button>
    </div>
  )
}


function MembershipTab({ account, onChanged }) {
  const { customer, membership, terms, plans } = account
  const [renewing, setRenewing] = useState(false)
  const [plan, setPlan] = useState('')
  const [payment, setPayment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCancel = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel your membership?')

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await callApi('/api/customer/membership/cancel', 'POST')
      onChanged('Your membership has been cancelled.')
    }
    catch (cancelError) {
      setError(cancelError.message)
    }
    finally {
      setSaving(false)
    }
  }

  const openRenew = () => {
    setRenewing(true)
    setPlan('')
    setPayment('')
    setError('')
  }

  const closeRenew = () => {
    setRenewing(false)
    setError('')
  }

  const handleRenew = async () => {
    if (!plan) {
      setError('Please choose a plan.')
      return
    }

    if (!payment) {
      setError('Please choose a payment method.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await callApi('/api/customer/membership/renew', 'POST', {
        MembershipType: plan,
        PaymentMethod: payment,
      })

      setRenewing(false)
      onChanged(`Your ${plan} membership is active. You paid ${money(result.total)}.`)
    }
    catch (renewError) {
      setError(renewError.message)
    }
    finally {
      setSaving(false)
    }
  }

  const hasMembership = membership !== null
  const isActive = hasMembership && membership.Status === 'active'
  const canCancel = isActive || (hasMembership && membership.Status === 'upcoming')
  const selectedPlan = plans.find((item) => item.MembershipType === plan)

  const picker = (
    <section className="cp-card">
      <div className="cp-label">
        {!hasMembership ? 'Join' : canCancel ? 'Change plan' : 'Renew'}
      </div>
      <h2>{hasMembership ? 'Choose a plan' : 'Become a member'}</h2>

      <div className="cp-plans">
        {plans.map((item) => {
          const isCurrent = isActive && item.MembershipType === membership.MembershipType

          return (
            <button
              key={item.MembershipType}
              type="button"
              className={`cp-option${item.MembershipType === plan ? ' is-selected' : ''}`}
              onClick={() => {
                setPlan(item.MembershipType)
                setError('')
              }}
              disabled={isCurrent}
            >
              <span className="cp-option-name">{item.MembershipType}</span>
              <span className="cp-option-text">{money(item.Price)} for one year</span>
              <span className="cp-option-meta">
                {isCurrent
                  ? 'Your current plan'
                  : `${item.DiscountPercent}% off tickets · ${item.GiftShopDiscount}% off gift shop · ${item.CafeDiscount}% off CoogCafe`}
              </span>
            </button>
          )
        })}
      </div>

      <div className="form-group cp-renew-payment">
        <label htmlFor="cp-membership-payment">Payment</label>
        <select
          id="cp-membership-payment"
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value)
            setError('')
          }}
        >
          <option value="">Choose a payment method</option>
          {MEMBERSHIP_PAYMENTS.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="cp-member-actions">
        {hasMembership && (
          <button type="button" className="btn secondary" onClick={closeRenew} disabled={saving}>
            Back
          </button>
        )}
        <button type="button" className="btn primary" onClick={handleRenew} disabled={saving}>
          {saving ? 'Processing...' : selectedPlan ? `Pay ${money(selectedPlan.Price)}` : 'Pay'}
        </button>
      </div>
    </section>
  )

  if (!hasMembership) {
    return (
      <div className="cp-stack">
        <section className="cp-card">
          <p className="cp-empty">You don't have a membership yet. Join to save on every ticket.</p>
        </section>

        {picker}
      </div>
    )
  }

  return (
    <div className="cp-stack">
      <section className="cp-card cp-member">
        <div className="cp-member-head">
          <div>
            <div className="cp-label">Membership</div>
            <h2>{membership.MembershipType}</h2>
          </div>
          <span className={`cp-status is-${membership.Status}`}>
            {STATUS_TEXT[membership.Status]}
          </span>
        </div>

        <dl className="cp-details">
          <div>
            <dt>Member</dt>
            <dd>{customer.FirstName} {customer.LastName}</dd>
          </div>
          <div>
            <dt>Member ID</dt>
            <dd>#{String(membership.MembershipID).padStart(5, '0')}</dd>
          </div>
          <div>
            <dt>Valid</dt>
            <dd>{formatDate(membership.StartDate)} - {formatDate(membership.EndDate)}</dd>
          </div>
          <div>
            <dt>Ticket discount</dt>
            <dd>{isActive ? `${membership.DiscountPercent}%` : 'None while inactive'}</dd>
          </div>
          <div>
            <dt>Gift shop</dt>
            <dd>{isActive ? `${membership.GiftShopDiscount}% off` : 'None while inactive'}</dd>
          </div>
          <div>
            <dt>CoogCafe</dt>
            <dd>{isActive ? `${membership.CafeDiscount}% off` : 'None while inactive'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{customer.Email}</dd>
          </div>
          {customer.Phone && (
            <div>
              <dt>Phone</dt>
              <dd>{customer.Phone}</dd>
            </div>
          )}
        </dl>

        {!canCancel && (
          <p className="cp-note">
            Your membership is {membership.Status}. Renew it to get your ticket discount back.
          </p>
        )}

        {!renewing && (
          <div className="cp-member-actions">
            <button type="button" className="btn primary" onClick={openRenew}>
              {canCancel ? 'Change Plan' : 'Renew Membership'}
            </button>

            {canCancel && (
              <button
                type="button"
                className="btn danger"
                onClick={handleCancel}
                disabled={saving}
              >
                {saving ? 'Cancelling...' : 'Cancel Membership'}
              </button>
            )}
          </div>
        )}
      </section>

      {renewing && picker}

      {!renewing && error && <p className="form-error" role="alert">{error}</p>}

      <section className="cp-card">
        <h2>Membership History</h2>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">Term</th>
                <th scope="col">Price</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.TermID}>
                  <td className="strong">{term.MembershipType}</td>
                  <td>{formatDate(term.StartDate)} - {formatDate(term.EndDate)}</td>
                  <td>{money(term.Price)}</td>
                  <td>{term.PaymentMethod}</td>
                  <td>
                    <span className={`badge badge-${term.Status}`}>
                      {STATUS_TEXT[term.Status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}


function PurchasesTab({ purchases }) {
  const [view, setView] = useState('tickets')
  const { tickets, orders, waitlist } = purchases

  return (
    <section className="cp-card">
      <div className="cp-card-head">
        <h2>Purchases</h2>

        <div className="cp-toggle" role="group" aria-label="Purchase type">
          <button
            type="button"
            className={view === 'tickets' ? 'is-active' : ''}
            aria-pressed={view === 'tickets'}
            onClick={() => setView('tickets')}
          >
            Tickets
          </button>
          <button
            type="button"
            className={view === 'orders' ? 'is-active' : ''}
            aria-pressed={view === 'orders'}
            onClick={() => setView('orders')}
          >
            Gift Shop
          </button>
          <button
            type="button"
            className={view === 'waitlist' ? 'is-active' : ''}
            aria-pressed={view === 'waitlist'}
            onClick={() => setView('waitlist')}
          >
            Waitlist
          </button>
        </div>
      </div>

      {view === 'tickets' && (
        tickets.length === 0 ? (
          <p className="cp-empty">You haven't bought any tickets yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Exhibition</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price</th>
                  <th scope="col">Bought</th>
                  <th scope="col">Visit Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.TicketID}>
                    <td className="strong">{ticket.ExhibitionName}</td>
                    <td>{ticket.TicketType}</td>
                    <td>{money(ticket.Price)}</td>
                    <td>{formatDate(ticket.SaleDate)}</td>
                    <td>
                      {ticket.VisitDate
                        ? formatDate(ticket.VisitDate)
                        : 'Not specified'}
                    </td>
                    <td>
                      <span className={`badge badge-${TICKET_STATUS[ticket.RefundStatus].variant}`}>
                        {TICKET_STATUS[ticket.RefundStatus].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {view === 'orders' && (
        orders.length === 0 ? (
          <p className="cp-empty">You haven't ordered anything from the gift shop yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.SaleID}>
                    <td className="strong">{order.ItemName}</td>
                    <td>{order.Quantity}</td>
                    <td>{money(order.Total)}</td>
                    <td>{order.PaymentMethod}</td>
                    <td>{formatDate(order.SaleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {view === 'waitlist' && (
        waitlist.length === 0 ? (
          <p className="cp-empty">You haven't joined any waitlists yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Exhibition</th>
                  <th scope="col">Type</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((entry) => (
                  <tr key={entry.WaitlistID}>
                    <td className="strong">{entry.ExhibitionName}</td>
                    <td>{entry.TicketType}</td>
                    <td>{formatDate(entry.JoinedAt)}</td>
                    <td>
                      <span className={`badge badge-${waitlistStatus(entry).variant}`}>
                        {waitlistStatus(entry).label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  )
}




function TicketsTab({ data, account, onBought }) {
  const [exhibitionId, setExhibitionId] = useState(null)
  const [counts, setCounts] = useState({})
  const [visitDate, setVisitDate] = useState('')
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)
  const [waitTypes, setWaitTypes] = useState({})
  const [waiting, setWaiting] = useState(false)
  const [schoolEmail, setSchoolEmail] = useState('')
  const [schoolEmailOk, setSchoolEmailOk] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [studentModalError, setStudentModalError] = useState('')
  const [pendingStudentCount, setPendingStudentCount] = useState(null)
  const [pendingWaitlistId, setPendingWaitlistId] = useState(null)

  const { exhibitions, waitlist, prices, discounts, waitlistLimit } = data
  const membership = account?.membership ?? account?.Membership ?? null
  const allowStudentTickets = canBuyStudentTickets(membership)
  const askForStudentEmail = needsStudentEmail(membership)
  const types = Object.keys(prices).filter((type) => {
    if (type === 'Student' && !allowStudentTickets) {
      return false
    }

    return true
  })
  const selected = exhibitions.find(
    (item) => item.ExhibitionID === exhibitionId
  )

  const discountedLimit = {
    Adult: 0,
    Child: 0,
    Student: 0,
    Senior: 0,
  }

  if (membership?.Status?.toLowerCase() === 'active') {
    if (membership.MembershipType === 'Dual') {
      discountedLimit.Adult = 2
    } else if (membership.MembershipType === 'Family') {
      discountedLimit.Adult = 2
      discountedLimit.Child = 2
    } else if (membership.MembershipType === 'Student') {
      discountedLimit.Adult = 2
    } else if (membership.MembershipType === 'Senior') {
      discountedLimit.Adult = 2
    }
  }

  const priceFor = (type, index = 0) => {
    const discount = index < (discountedLimit[type] || 0)
      ? (discounts?.[type] ?? 0)
      : 0

    return prices[type] * (1 - discount / 100)
  }

  const totalCount = types.reduce(
    (sum, type) => sum + (counts[type] || 0),
    0
  )

  const totalPrice = types.reduce(
    (sum, type) =>
      sum +
      Array.from(
        { length: counts[type] || 0 },
        (_, index) => priceFor(type, index)
      ).reduce((subtotal, price) => subtotal + price, 0),
    0
  )

  const limit = selected ? selected.Remaining : 0

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')


  const setCount = (type, value) => {
    setCounts((current) => ({
      ...current,
      [type]: value,
    }))
    setError('')
  }

  const closeStudentModal = () => {
    setStudentModalOpen(false)
    setPendingStudentCount(null)
    setPendingWaitlistId(null)
    setStudentModalError('')
  }

  const changeTicketCount = (type, value) => {
    if (type !== 'Student' || !askForStudentEmail || value <= (counts.Student || 0)) {
      if (type === 'Student' && value === 0) {
        setSchoolEmailOk(false)
        setSchoolEmail('')
      }

      setCount(type, value)
      return
    }

    if (schoolEmailOk) {
      setCount(type, value)
      return
    }

    setPendingStudentCount(value)
    setPendingWaitlistId(null)
    setStudentModalError('')
    setStudentModalOpen(true)
  }


  const chooseExhibition = (id) => {
    const item = exhibitions.find(
      (exhibition) => exhibition.ExhibitionID === id
    )

    setExhibitionId(id)
    setCounts({})
    setVisitDate(item?.StartDate || '')
    setError('')
  }

  const handleBuy = async () => {
    if (!selected) {
      setError('Please choose an exhibition.')
      return
    }

    if (!visitDate) {
      setError('Please choose a visit date.')
      return
    }

    if (
      visitDate < selected.StartDate ||
      visitDate > selected.EndDate
    ) {
      setError('Choose a date within the exhibition dates.')
      return
    }

    if (visitDate < today) {
      setError('The visit date cannot be in the past.')
      return
    }

    if (totalCount === 0) {
      setError('Please choose at least one ticket.')
      return
    }

    if ((counts.Student || 0) > 0 && askForStudentEmail && !schoolEmailOk) {
      setPendingStudentCount(null)
      setPendingWaitlistId(null)
      setStudentModalError('')
      setStudentModalOpen(true)
      return
    }

    setBuying(true)
    setError('')

    try {
      const result = await callApi('/api/customer/tickets', 'POST', {
        ExhibitionID: exhibitionId,
        VisitDate: visitDate,
        Tickets: counts,
        SchoolEmail: askForStudentEmail ? schoolEmail : undefined,
      })

      setCounts({})
      setVisitDate('')
      setExhibitionId(null)
      setSchoolEmail('')
      setSchoolEmailOk(false)

      onBought(
        `You bought ${result.count} ${result.count === 1 ? 'ticket' : 'tickets'
        } for ${money(result.total)}.`
      )
    } catch (buyError) {
      setError(buyError.message)
    } finally {
      setBuying(false)
    }
  }

  const handleJoin = async (id, email) => {
    const ticketType = waitTypes[id] || types[0]

    if (ticketType === 'Student' && askForStudentEmail && !schoolEmailOk && !email) {
      setPendingWaitlistId(id)
      setPendingStudentCount(null)
      setStudentModalError('')
      setStudentModalOpen(true)
      return
    }

    setWaiting(true)
    setError('')

    try {
      await callApi('/api/customer/waitlist', 'POST', {
        ExhibitionID: id,
        TicketType: ticketType,
        SchoolEmail: email || schoolEmail,
      })

      onBought(
        'You are on the waitlist. We will let you know when a spot opens up.'
      )
    } catch (waitError) {
      setError(waitError.message)
    } finally {
      setWaiting(false)
    }
  }

  const confirmStudentEmail = () => {
    const email = schoolEmail.trim()

    if (!COUGARNET_PATTERN.test(email)) {
      setStudentModalError(
        'Student tickets require an approved school email ending in @cougarnet.uh.edu.'
      )
      return
    }

    setSchoolEmail(email)
    setSchoolEmailOk(true)
    setStudentModalError('')
    setStudentModalOpen(false)

    if (pendingStudentCount !== null) {
      setCount('Student', pendingStudentCount)
      setPendingStudentCount(null)
    }

    if (pendingWaitlistId !== null) {
      const exhibitionIdToJoin = pendingWaitlistId
      setPendingWaitlistId(null)
      handleJoin(exhibitionIdToJoin, email)
    }
  }

  const handleLeave = async (id) => {
    setWaiting(true)
    setError('')

    try {
      await callApi('/api/customer/waitlist/leave', 'POST', {
        WaitlistID: id,
      })

      onBought('You left the waitlist.')
    } catch (waitError) {
      setError(waitError.message)
    } finally {
      setWaiting(false)
    }
  }

  if (exhibitions.length === 0) {
    return (
      <section className="cp-card">
        <p className="cp-empty">
          There are no exhibitions available for booking right now.
          Please check back soon.
        </p>
      </section>
    )
  }

  return (
    <div className="cp-buy">
      <section className="cp-card">
        <div className="cp-label">Step 1</div>
        <h2>Choose an exhibition</h2>

        <div className="cp-options">
          {exhibitions.map((item) => {
            const soldOut = item.Remaining === 0
            const entry = waitlist.find(
              (spot) => spot.ExhibitionID === item.ExhibitionID
            )

            if (soldOut) {
              return (
                <div
                  key={item.ExhibitionID}
                  className="cp-option is-soldout"
                >
                  <span className="cp-option-name">{item.Name}</span>

                  {item.Description && (
                    <span className="cp-option-text">
                      {item.Description}
                    </span>
                  )}

                  <span className="cp-option-meta">
                    {formatDate(item.StartDate)} – {formatDate(item.EndDate)}
                    {' · '}Sold out
                    {' · '}Waitlist {item.WaitlistCount} of {waitlistLimit}
                  </span>

                  <div className="cp-waitlist">
                    {entry ? (
                      <>
                        <span>
                          You are on the waitlist ({entry.TicketType})
                        </span>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => handleLeave(entry.WaitlistID)}
                          disabled={waiting}
                        >
                          Leave
                        </button>
                      </>
                    ) : item.WaitlistFull ? (
                      <span>The waitlist is full</span>
                    ) : (
                      <>
                        <select
                          aria-label={`Ticket type for ${item.Name}`}
                          value={waitTypes[item.ExhibitionID] || types[0]}
                          onChange={(event) =>
                            setWaitTypes((current) => ({
                              ...current,
                              [item.ExhibitionID]: event.target.value,
                            }))
                          }
                        >
                          {types.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => handleJoin(item.ExhibitionID)}
                          disabled={waiting}
                        >
                          Join Waitlist
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <button
                key={item.ExhibitionID}
                type="button"
                className={`cp-option${item.ExhibitionID === exhibitionId ? ' is-selected' : ''
                  }`}
                onClick={() => chooseExhibition(item.ExhibitionID)}
              >
                <span className="cp-option-name">{item.Name}</span>

                {item.Description && (
                  <span className="cp-option-text">
                    {item.Description}
                  </span>
                )}

                <span className="cp-option-meta">
                  {formatDate(item.StartDate)} – {formatDate(item.EndDate)}
                  {' · '}{item.Remaining} left
                  {entry && entry.Status === 'Notified' &&
                    ' · A spot opened for you'}
                </span>
              </button>
            )
          })}
        </div>

        {error && !selected && (
          <p className="form-error" role="alert">{error}</p>
        )}
      </section>

      <section className="cp-card cp-summary">
        <div className="cp-label">Step 2</div>
        <h2>Choose tickets and visit date</h2>

        {!selected ? (
          <p className="cp-empty">Choose an exhibition first.</p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="ticket-visit-date">Visit date</label>
              <input
                id="ticket-visit-date"
                type="date"
                value={visitDate}
                min={selected.StartDate > today ? selected.StartDate : today}
                max={selected.EndDate}
                onChange={(event) => {
                  setVisitDate(event.target.value)
                  setError('')
                }}
                required
              />
            </div>

            <ul className="cp-lines">
              {types.map((type) => {
                const count = counts[type] || 0
                const memberLimit = discountedLimit[type] || 0
                const memberCount = Math.min(count, memberLimit)
                const regularCount = count - memberCount
                const memberPrice = priceFor(type, 0)
                const regularPrice = prices[type]

                return (
                  <li key={type} className="cp-line">
                    <div>
                      <div className="strong">{type}</div>
                      <div className="cp-price">
                        {memberCount > 0 && regularCount > 0 ? (
                          <>
                            {money(memberPrice)} × {memberCount}
                            {' · '}
                            {money(regularPrice)} × {regularCount}
                          </>
                        ) : memberLimit > 0 ? (
                          <>
                            {money(memberPrice)}
                            <s>{money(regularPrice)}</s>
                          </>
                        ) : (
                          money(regularPrice)
                        )}
                      </div>
                    </div>

                    <Stepper
                      label={`${type} tickets`}
                      value={count}
                      max={count + limit - totalCount}
                      onChange={(value) => changeTicketCount(type, value)}
                    />
                  </li>
                )
              })}
            </ul>

            <div className="cp-total">
              <span>Total</span>
              <strong>{money(totalPrice)}</strong>
            </div>

            {error && (
              <p className="form-error" role="alert">{error}</p>
            )}

            <button
              type="button"
              className="btn primary cp-wide"
              onClick={handleBuy}
              disabled={totalCount === 0 || buying}
            >
              {buying
                ? 'Buying...'
                : `Buy ${totalCount || ''} ${totalCount === 1 ? 'Ticket' : 'Tickets'
                }`}
            </button>
          </>
        )}
      </section>

      <Modal
        open={studentModalOpen}
        title="UH student email"
        onClose={closeStudentModal}
      >
        <p>Student tickets require your UH CougarNet email.</p>

        <div className="form-group">
          <label htmlFor="student-ticket-email">CougarNet email</label>
          <input
            id="student-ticket-email"
            type="email"
            maxLength={255}
            placeholder="yourname@cougarnet.uh.edu"
            value={schoolEmail}
            onChange={(event) => {
              setSchoolEmail(event.target.value)
              setStudentModalError('')
            }}
          />
        </div>

        {studentModalError && (
          <p className="form-error" role="alert">{studentModalError}</p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={closeStudentModal}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={confirmStudentEmail}>
            Continue
          </button>
        </div>
      </Modal>
    </div>
  )
}




function ShopTab({ items, account, onBought }) {
  const [cart, setCart] = useState({})
  const [payment, setPayment] = useState('')
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  const membership = account?.membership ?? null
  const shopDiscount =
    membership?.Status?.toLowerCase() === 'active'
      ? Number(membership.GiftShopDiscount) || 0
      : 0

  const priceFor = (item) => item.Price * (1 - shopDiscount / 100)

  const lines = items.filter((item) => cart[item.ItemID] > 0)
  const total = lines.reduce(
    (sum, item) => sum + priceFor(item) * cart[item.ItemID],
    0
  )

  const setQuantity = (itemId, value) => {
    setCart((current) => ({ ...current, [itemId]: value }))
    setError('')
  }

  const handleOrder = async () => {
    if (!payment) {
      setError('Please choose a payment method.')
      return
    }

    setBuying(true)
    setError('')

    try {
      const result = await callApi('/api/customer/shop/orders', 'POST', {
        PaymentMethod: payment,
        Items: lines.map((item) => ({ ItemID: item.ItemID, Quantity: cart[item.ItemID] })),
      })

      setCart({})
      setPayment('')
      onBought(`Thank you! Your order of ${money(result.total)} has been placed.`)
    }
    catch (orderError) {
      setError(orderError.message)
    }
    finally {
      setBuying(false)
    }
  }

  if (items.length === 0) {
    return (
      <section className="cp-card">
        <p className="cp-empty">The gift shop has no items right now.</p>
      </section>
    )
  }

  return (
    <div className="cp-buy">
      <div className="cp-items">
        {items.map((item) => {
          const inCart = cart[item.ItemID] || 0
          const soldOut = item.Stock === 0

          return (
            <section key={item.ItemID} className={`cp-card cp-item${soldOut ? ' is-out' : ''}`}>
              <div className="cp-label">{item.Category}</div>
              <h3>{item.ItemName}</h3>
              <div className="cp-item-price">
                {money(priceFor(item))}
                {shopDiscount > 0 && <s>{money(item.Price)}</s>}
              </div>
              <div className={`cp-item-stock${!soldOut && item.Stock > 5 ? ' is-in' : ''}`}>
                {soldOut ? 'Out of stock' : item.Stock <= 5 ? `Only ${item.Stock} left` : 'In stock'}
              </div>

              {!soldOut && (
                inCart === 0 ? (
                  <button
                    type="button"
                    className="btn secondary cp-wide"
                    onClick={() => setQuantity(item.ItemID, 1)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <Stepper
                    label={item.ItemName}
                    value={inCart}
                    max={Math.min(item.Stock, MAX_PER_ORDER)}
                    onChange={(value) => setQuantity(item.ItemID, value)}
                  />
                )
              )}
            </section>
          )
        })}
      </div>

      <section className="cp-card cp-summary">
        <h2>Your Cart</h2>

        {lines.length === 0 ? (
          <p className="cp-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cp-lines">
              {lines.map((item) => (
                <li key={item.ItemID} className="cp-line">
                  <span>{item.ItemName} × {cart[item.ItemID]}</span>
                  <span>{money(priceFor(item) * cart[item.ItemID])}</span>
                </li>
              ))}
            </ul>

            <div className="cp-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>

            <div className="form-group">
              <label htmlFor="cp-payment">Payment</label>
              <select
                id="cp-payment"
                value={payment}
                onChange={(e) => {
                  setPayment(e.target.value)
                  setError('')
                }}
              >
                <option value="">Choose a payment method</option>
                {ONLINE_PAYMENTS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button
              type="button"
              className="btn primary cp-wide"
              onClick={handleOrder}
              disabled={buying}
            >
              {buying ? 'Placing Order...' : 'Place Order'}
            </button>
          </>
        )}
      </section>
    </div>
  )
}



function Notices({ purchases, waitlist, onLeave, onGo }) {
  const cancelled = []

  for (const ticket of purchases.tickets) {
    if (ticket.RefundStatus !== 'Pending' || ticket.NotificationStatus !== 'Sent') {
      continue
    }

    const existing = cancelled.find((item) => item.name === ticket.ExhibitionName)

    if (existing) {
      existing.count = existing.count + 1
    }
    else {
      cancelled.push({
        name: ticket.ExhibitionName,
        reason: ticket.CancellationReason,
        count: 1,
      })
    }
  }

  const openSpots = waitlist.filter((entry) => entry.Status === 'Notified')

  if (cancelled.length === 0 && openSpots.length === 0) {
    return null
  }

  return (
    <div className="cp-notices">
      {cancelled.map((item) => (
        <p key={item.name} className="cp-notice" role="status">
          <strong>{item.name}</strong> was cancelled
          {item.reason ? ` (${item.reason})` : ''}.
          {' '}
          Your {item.count} {item.count === 1 ? 'ticket is' : 'tickets are'} being refunded.
        </p>
      ))}

      {openSpots.map((entry) => (
        <p key={entry.WaitlistID} className="cp-notice" role="status">
          <span>
            A spot opened up for <strong>{entry.ExhibitionName}</strong>. Buy your ticket before it is gone.
          </span>
          <span className="cp-notice-actions">
            <button type="button" className="btn secondary" onClick={onGo}>Buy Tickets</button>
            <button type="button" className="btn secondary" onClick={() => onLeave(entry.WaitlistID)}>Leave Waitlist</button>
          </span>
        </p>
      ))}
    </div>
  )
}


function CustomerPage() {
  const [searchParams] = useSearchParams()
  const linkedTab = searchParams.get('tab')
  const [tab, setTab] = useState(
    TABS.some((item) => item.id === linkedTab) ? linkedTab : 'membership'
  )

  useEffect(() => {
    if (TABS.some((item) => item.id === linkedTab)) {
      setTab(linkedTab)
    }
  }, [linkedTab])
  const [account, setAccount] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [shopItems, setShopItems] = useState(null)
  const [purchases, setPurchases] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [accountData, exhibitionData, items, purchaseData] = await Promise.all([
        callApi('/api/customer/account', 'GET'),
        callApi('/api/customer/exhibitions', 'GET'),
        callApi('/api/customer/shop', 'GET'),
        callApi('/api/customer/purchases', 'GET'),
      ])

      setAccount(accountData)
      setTicketData(exhibitionData)
      setShopItems(items)
      setPurchases(purchaseData)
      setLoadError('')
    }
    catch (error) {
      setLoadError(error.message)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const switchTab = (id) => {
    setTab(id)
    setMessage('')
  }

  const handleBought = (text) => {
    setMessage(text)
    loadAll()

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }

  const handleLeave = async (waitlistId) => {
    try {
      await callApi('/api/customer/waitlist/leave', 'POST', { WaitlistID: waitlistId })
      handleBought('You left the waitlist.')
    }
    catch (leaveError) {
      setMessage(leaveError.message)
    }
  }

  const firstName = account ? account.customer.FirstName : ''

  return (
    <div className="cp-page">
      <header className="cp-header">
        <h1>{firstName ? `Welcome back, ${firstName}` : 'My Account'}</h1>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tab${tab === item.id ? ' active' : ''}`}
            onClick={() => switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <p className="cp-success" role="status">{message}</p>}

      {purchases && ticketData && (
        <Notices
          purchases={purchases}
          waitlist={ticketData.waitlist}
          onLeave={handleLeave}
          onGo={() => switchTab('tickets')}
        />
      )}

      {loadError && (
        <p className="form-error" role="alert">Could not load your account: {loadError}</p>
      )}

      {!loadError && account === null && <p className="cp-empty">Loading...</p>}

      {account && tab === 'membership' && <MembershipTab account={account} onChanged={handleBought} />}
      {ticketData && tab === 'tickets' && <TicketsTab data={ticketData} account={account} onBought={handleBought} />}
      {shopItems && tab === 'shop' && (
        <ShopTab items={shopItems} account={account} onBought={handleBought} />
      )}
      {purchases && tab === 'purchases' && <PurchasesTab purchases={purchases} />}
    </div>
  )
}

export default CustomerPage