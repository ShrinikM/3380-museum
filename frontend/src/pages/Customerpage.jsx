import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { callApi } from '../api'
import { Modal } from '../components/ui'
import { TablePager, usePagedList } from '../components/TablePager'
import './Customerpage.css'

const TABS = [
  { id: 'membership', label: 'My Membership' },
  { id: 'tickets', label: 'Buy Tickets' },
  { id: 'shop', label: 'Gift Shop' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'details', label: 'My Details' },
]

const COUGARNET_PATTERN = /^[^\s@]+@cougarnet\.uh\.edu$/i
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

function needsStudentEmail(membership) {
  return (
    !membershipBenefitsActive(membership) ||
    membership.MembershipType !== 'Student'
  )
}

const STATUS_TEXT = {
  active: 'Active',
  ending: 'Ending',
  upcoming: 'Starts soon',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

function membershipBenefitsActive(membership) {
  return (
    membership &&
    (membership.Status === 'active' || membership.Status === 'ending')
  )
}

const TICKET_STATUS = {
  None: { label: 'Valid', variant: 'active' },
  Pending: { label: 'Refund pending', variant: 'upcoming' },
  Refunded: { label: 'Refunded', variant: 'completed' },
}

function ticketStatus(refundStatus) {
  return (
    TICKET_STATUS[refundStatus] || {
      label: refundStatus || 'Unknown',
      variant: 'expired',
    }
  )
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

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return 0
  }

  const dob = new Date(`${dateOfBirth}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--
  }

  return age
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

function groupWaitlistQueue(waitlist) {
  const groups = new Map()

  for (const entry of waitlist || []) {
    if (entry.Status !== 'Waiting' && entry.Status !== 'Notified') {
      continue
    }

    const id = Number(entry.ExhibitionID)
    const existing = groups.get(id)
    const position = Number(entry.QueuePosition) || 1

    if (!existing) {
      groups.set(id, {
        ExhibitionID: id,
        ExhibitionName: entry.ExhibitionName,
        QueuePosition: position,
        count: 1,
        openedSpots: entry.Status === 'Notified' ? 1 : 0,
      })
      continue
    }

    existing.count += 1

    if (entry.Status === 'Notified') {
      existing.openedSpots += 1
    }

    if (position < existing.QueuePosition) {
      existing.QueuePosition = position
    }
  }

  return Array.from(groups.values())
}

function MembershipTab({ account, waitlist, onBuyTickets, onChanged }) {
  const { customer, membership, terms, plans } = account
  const queue = groupWaitlistQueue(waitlist)
  const [renewing, setRenewing] = useState(false)
  const [plan, setPlan] = useState('')
  const [payment, setPayment] = useState('')
  const [membershipPayments, setMembershipPayments] = useState([])
  const [schoolEmail, setSchoolEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    callApi('/api/payment-methods?for=online_membership', 'GET')
      .then(setMembershipPayments)
      .catch(() => setMembershipPayments([]))
  }, [])

  const handleCancelClick = () => {
    setCancelError('')
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    setSaving(true)
    setCancelError('')

    try {
      const result = await callApi('/api/customer/membership/cancel', 'POST')
      setCancelModalOpen(false)
      onChanged(
        result.message ||
          'No refunds. Your membership stays active until it expires after a year.'
      )
    }
    catch (cancelError) {
      setCancelError(cancelError.message)
    }
    finally {
      setSaving(false)
    }
  }

  const openRenew = () => {
    setRenewing(true)
    setPlan('')
    setPayment('')
    setSchoolEmail('')
    setDateOfBirth('')
    setError('')
  }

  const closeRenew = () => {
    setRenewing(false)
    setError('')
  }

  const validStudentEmail = COUGARNET_PATTERN.test(schoolEmail.trim())
  const validSeniorDob =
    dateOfBirth !== '' &&
    dateOfBirth < new Date().toISOString().slice(0, 10) &&
    calculateAge(dateOfBirth) >= 65

  const canPay =
    plan !== '' &&
    payment !== '' &&
    (plan !== 'Student' || validStudentEmail) &&
    (plan !== 'Senior' || validSeniorDob)

  const handleRenew = async () => {
    if (!plan) {
      setError('Please choose a plan.')
      return
    }

    if (plan === 'Student' && !validStudentEmail) {
      setError('Student memberships require an approved school email ending in @cougarnet.uh.edu.')
      return
    }

    if (plan === 'Senior' && !dateOfBirth) {
      setError('Date of birth is required for Senior memberships.')
      return
    }

    if (plan === 'Senior' && !validSeniorDob) {
      setError('Senior memberships require you to be at least 65 years old.')
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
        SchoolEmail: plan === 'Student' ? schoolEmail.trim() : undefined,
        DateOfBirth: plan === 'Senior' ? dateOfBirth : undefined,
      })

      setRenewing(false)
      onChanged(
        result.message
          ? `${result.message} You paid ${money(result.total)}.`
          : `Your ${plan} membership is active. You paid ${money(result.total)}.`
      )
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
  const isEnding = hasMembership && membership.Status === 'ending'
  const benefitsOn = membershipBenefitsActive(membership)
  const isUpcoming = hasMembership && membership.Status === 'upcoming'
  const canCancel = isActive || isUpcoming
  const canChangePlan = benefitsOn || isUpcoming
  const selectedPlan = plans.find((item) => item.MembershipType === plan)
  const scheduledTerm = (terms || []).find((term) => term.Status === 'upcoming')
  const benefitUntil = formatDate(membership?.EndDate)
  const {
    visibleRows: historyRows,
    page: historyPage,
    total: historyTotal,
    setPage: setHistoryPage,
  } = usePagedList(terms, membership?.MembershipID || 'none')

  const picker = (
    <section className="cp-card">
      <div className="cp-label">
        {!hasMembership ? 'Join' : canChangePlan ? 'Change plan' : 'Renew'}
      </div>
      <h2>{hasMembership ? 'Choose a plan' : 'Become a member'}</h2>

      <div className="cp-plans">
        {plans.map((item) => {
          const isCurrent =
            benefitsOn && item.MembershipType === membership.MembershipType
          const isScheduled =
            scheduledTerm &&
            item.MembershipType === scheduledTerm.MembershipType &&
            !(isUpcoming && item.MembershipType === membership.MembershipType)

          return (
            <button
              key={item.MembershipType}
              type="button"
              className={`cp-option${item.MembershipType === plan ? ' is-selected' : ''}`}
              onClick={() => {
                setPlan(item.MembershipType)
                setError('')
              }}
              disabled={isCurrent || Boolean(isScheduled)}
            >
              <span className="cp-option-name">{item.MembershipType}</span>
              <span className="cp-option-text">{money(item.Price)} for one year</span>
              <span className="cp-option-meta">
                {isCurrent
                  ? 'Your current plan'
                  : isScheduled
                    ? `Starts ${formatDate(scheduledTerm.StartDate)}`
                    : `${item.DiscountPercent}% off tickets - ${item.GiftShopDiscount}% off gift shop - ${item.CafeDiscount}% off CoogCafe`}
              </span>
            </button>
          )
        })}
      </div>

      {plan === 'Student' && (
        <div className="form-group cp-renew-payment">
          <label htmlFor="cp-membership-school-email">UH school email</label>
          <input
            id="cp-membership-school-email"
            type="email"
            maxLength={255}
            placeholder="yourname@cougarnet.uh.edu"
            value={schoolEmail}
            onChange={(event) => {
              setSchoolEmail(event.target.value)
              setError('')
            }}
          />
        </div>
      )}

      {plan === 'Senior' && (
        <div className="form-group cp-renew-payment">
          <label htmlFor="cp-membership-dob">Date of birth</label>
          <input
            id="cp-membership-dob"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={dateOfBirth}
            onChange={(event) => {
              setDateOfBirth(event.target.value)
              setError('')
            }}
          />
        </div>
      )}

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
          {membershipPayments.map((method) => (
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
        <button
          type="button"
          className="btn primary"
          onClick={handleRenew}
          disabled={saving || !canPay}
        >
          {saving ? 'Processing...' : selectedPlan ? `Pay ${money(selectedPlan.Price)}` : 'Pay'}
        </button>
      </div>
    </section>
  )

  const waitlistNote =
    queue.length > 0 ? (
      <div className="cp-waitlist-note" role="status">
        {queue.map((item) => {
          const canBuy = item.openedSpots > 0

          return (
            <p key={item.ExhibitionID}>
              <strong>{item.ExhibitionName}</strong>
              {' — '}
              {canBuy ? (
                <>
                  #0 in line
                  {' · '}
                  <button
                    type="button"
                    className="cp-text-link"
                    onClick={onBuyTickets}
                  >
                    Buy tickets
                  </button>
                </>
              ) : (
                <>#{item.QueuePosition} in line</>
              )}
            </p>
          )
        })}
      </div>
    ) : null

  if (!hasMembership) {
    return (
      <div className="cp-stack">
        {waitlistNote}
        <section className="cp-card">
          <p className="cp-empty">You don't have a membership yet. Join to save on every ticket.</p>
        </section>

        {picker}
      </div>
    )
  }

  return (
    <div className="cp-stack">
      {waitlistNote}

      <section className="cp-card cp-member">
        <div className="cp-member-head">
          <div>
            <div className="cp-label">Membership</div>
            <h2>{membership.MembershipType}</h2>
          </div>
          <span className={`cp-status is-${membership.Status}`}>
            {isEnding
              ? `Active until ${benefitUntil}`
              : STATUS_TEXT[membership.Status]}
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
            <dd>
              {benefitsOn
                ? `${membership.DiscountPercent}% · active until ${benefitUntil}`
                : 'None while inactive'}
            </dd>
          </div>
          <div>
            <dt>Gift shop</dt>
            <dd>
              {benefitsOn
                ? `${membership.GiftShopDiscount}% off · active until ${benefitUntil}`
                : 'None while inactive'}
            </dd>
          </div>
          <div>
            <dt>CoogCafe</dt>
            <dd>
              {benefitsOn
                ? `${membership.CafeDiscount}% off · active until ${benefitUntil}`
                : 'None while inactive'}
            </dd>
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

        {isEnding && (
          <p className="cp-note">
            Cancellation recorded. No refunds. Benefits stay active until {benefitUntil}, then
            this membership ends.
          </p>
        )}

        {scheduledTerm && (
          <p className="cp-note">
            Your plan changes to {scheduledTerm.MembershipType} on{' '}
            {formatDate(scheduledTerm.StartDate)}. No refunds on the current term.
          </p>
        )}

        {!canChangePlan && (
          <p className="cp-note">
            Your membership is {membership.Status}. Renew it to get your ticket discount back.
          </p>
        )}

        {!renewing && (
          <div className="cp-member-actions">
            <button type="button" className="btn primary" onClick={openRenew}>
              {canChangePlan ? 'Change Plan' : 'Renew Membership'}
            </button>

            {canCancel && (
              <button
                type="button"
                className="btn danger"
                onClick={handleCancelClick}
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
              {historyRows.map((term) => (
                <tr key={term.TermID}>
                  <td className="strong">{term.MembershipType}</td>
                  <td>{formatDate(term.StartDate)} - {formatDate(term.EndDate)}</td>
                  <td>{money(term.Price)}</td>
                  <td>{term.PaymentMethod}</td>
                  <td>
                    <span className={`badge badge-${term.Status}`}>
                      {term.Status === 'ending'
                        ? `Active until ${formatDate(term.EndDate)}`
                        : STATUS_TEXT[term.Status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePager
          page={historyPage}
          total={historyTotal}
          onChange={setHistoryPage}
        />
      </section>

      <Modal
        open={cancelModalOpen}
        title="Cancel Membership"
        onClose={() => setCancelModalOpen(false)}
      >
        <div className="form-grid">
          {cancelError && (
            <p className="form-error form-full" role="alert">
              {cancelError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            No refunds. Your membership stays active until {formatDate(membership.EndDate)}, then it ends. Ticket, gift shop, and CoogCafe discounts keep working until that date. You can still change plans for next year.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={saving}
            >
              Keep Membership
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={handleConfirmCancel}
              disabled={saving}
            >
              {saving ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function DetailsTab({ account, onUpdated }) {
  const { customer } = account
  const [firstName, setFirstName] = useState(customer.FirstName || '')
  const [lastName, setLastName] = useState(customer.LastName || '')
  const [email, setEmail] = useState(customer.Email || '')
  const [phone, setPhone] = useState(customer.Phone || '')
  const [currentPassword, setCurrentPassword] = useState('')

  const [currentPasswordPw, setCurrentPasswordPw] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [detailsError, setDetailsError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveDetails = async (e) => {
    e.preventDefault()
    setDetailsError('')

    if (!NAME_PATTERN.test(firstName.trim())) {
      setDetailsError('First name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if (!NAME_PATTERN.test(lastName.trim())) {
      setDetailsError('Last name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if (phone.trim() !== '' && phone.replace(/\D/g, '').length !== 10) {
      setDetailsError('Phone number must have 10 digits.')
      return
    }

    if (!currentPassword) {
      setDetailsError('Please enter your current password to update your details.')
      return
    }

    setSavingDetails(true)
    try {
      await callApi('/api/customer/details', 'PUT', {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        CurrentPassword: currentPassword,
      })
      setCurrentPassword('')
      onUpdated('Your personal details have been updated successfully.')
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setSavingDetails(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      await callApi('/api/customer/password', 'PUT', {
        CurrentPassword: currentPasswordPw,
        NewPassword: newPassword,
      })
      setCurrentPasswordPw('')
      setNewPassword('')
      setConfirmPassword('')
      onUpdated('Your password has been changed successfully.')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="cp-details-grid">
      <section className="cp-card">
        <h2>Personal details</h2>
        <form className="cp-form" onSubmit={handleSaveDetails}>
          <div className="cp-form-row">
            <div className="form-group">
              <label htmlFor="edit-first-name">First name</label>
              <input
                id="edit-first-name"
                type="text"
                maxLength={100}
                value={firstName}
                onChange={(e)=>setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-last-name">Last name</label>
              <input
                id="edit-last-name"
                type="text"
                maxLength={100}
                value={lastName}
                onChange={(e)=>setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="cp-form-row">
            <div className="form-group">
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-phone">Phone (optional)</label>
              <input
                id="edit-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digits"
                value={phone}
                onChange={(e)=>setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-details-password">Current password</label>
            <input
              id="edit-details-password"
              type="password"
              value={currentPassword}
              onChange={(e)=>setCurrentPassword(e.target.value)}
              required
            />
          </div>

          {detailsError && <p className="form-error" role="alert">{detailsError}</p>}

          <button type="submit" className="btn primary" disabled={savingDetails}>
            {savingDetails ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="cp-card">
        <h2>Change password</h2>
        <form className="cp-form" onSubmit={handleSavePassword}>
          <div className="form-group">
            <label htmlFor="current-pw">Current password</label>
            <input
              id="current-pw"
              type="password"
              value={currentPasswordPw}
              onChange={(e)=>setCurrentPasswordPw(e.target.value)}
              required
            />
          </div>

          <div className="cp-form-row">
            <div className="form-group">
              <label htmlFor="new-pw">New password</label>
              <input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {passwordError && <p className="form-error" role="alert">{passwordError}</p>}

          <button type="submit" className="btn primary" disabled={savingPassword}>
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  )
}

function PurchasesTab({ purchases, onChanged }) {
  const [view, setView] = useState('tickets')
  const [leavingId, setLeavingId] = useState(null)
  const [leaveError, setLeaveError] = useState('')
  const { tickets, orders, waitlist } = purchases

  const rows =
    view === 'tickets' ? tickets : view === 'orders' ? orders : waitlist
  const { visibleRows, page, total, setPage } = usePagedList(rows, view)

  const handleLeave = async (waitlistId) => {
    setLeavingId(waitlistId)
    setLeaveError('')

    try {
      await callApi('/api/customer/waitlist/leave', 'POST', {
        WaitlistID: waitlistId,
      })
      onChanged('You left the waitlist.')
    } catch (error) {
      setLeaveError(error.message)
    } finally {
      setLeavingId(null)
    }
  }

  return (
    <section className="cp-card">
      <div className="cp-card-head">
        <h2>Purchases</h2>

        <div className="page-header-actions">
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
      </div>

      {view === 'tickets' && (
        tickets.length === 0 ? (
          <p className="cp-empty">You haven't bought any tickets yet.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table cp-ticket-table">
                <thead>
                  <tr>
                    <th scope="col">Exhibition</th>
                    <th scope="col">Type</th>
                    <th scope="col">Price</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Bought</th>
                    <th scope="col">Visit Date</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((ticket) => (
                    <tr key={ticket.TicketID}>
                      <td className="strong">{ticket.ExhibitionName}</td>
                      <td>{ticket.TicketType}</td>
                      <td>{money(ticket.Price)}</td>
                      <td>{ticket.PaymentMethod || '-'}</td>
                      <td>{formatDate(ticket.SaleDate)}</td>
                      <td>
                        {ticket.VisitDate
                          ? formatDate(ticket.VisitDate)
                          : 'Not specified'}
                      </td>
                      <td>
                        <span className={`badge badge-${ticketStatus(ticket.RefundStatus).variant}`}>
                          {ticketStatus(ticket.RefundStatus).label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePager
              page={page}
              total={total}
              onChange={setPage}
            />
          </>
        )
      )}

      {view === 'orders' && (
        orders.length === 0 ? (
          <p className="cp-empty">You haven't ordered anything from the gift shop yet.</p>
        ) : (
          <>
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
                  {visibleRows.map((order) => (
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

            <TablePager
              page={page}
              total={total}
              onChange={setPage}
            />
          </>
        )
      )}

      {view === 'waitlist' && (
        waitlist.length === 0 ? (
          <p className="cp-empty">You haven't joined any waitlists yet.</p>
        ) : (
          <>
            {leaveError && (
              <p className="form-error" role="alert">
                {leaveError}
              </p>
            )}

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Exhibition</th>
                    <th scope="col">Type</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="store-restock-col">
                      <span className="sr-only">Leave waitlist</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((entry) => {
                    const canLeave =
                      entry.Status === 'Waiting' || entry.Status === 'Notified'

                    return (
                      <tr key={entry.WaitlistID}>
                        <td className="strong">{entry.ExhibitionName}</td>
                        <td>{entry.TicketType}</td>
                        <td>{formatDate(entry.JoinedAt)}</td>
                        <td>
                          <span
                            className={`badge badge-${waitlistStatus(entry).variant}`}
                          >
                            {waitlistStatus(entry).label}
                          </span>
                        </td>
                        <td className="store-restock-col">
                          {canLeave ? (
                            <button
                              type="button"
                              className="btn secondary store-restock-btn"
                              onClick={() => handleLeave(entry.WaitlistID)}
                              disabled={leavingId === entry.WaitlistID}
                            >
                              {leavingId === entry.WaitlistID
                                ? 'Leaving...'
                                : 'Leave'}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <TablePager
              page={page}
              total={total}
              onChange={setPage}
            />
          </>
        )
      )}
    </section>
  )
}

function TicketsTab({ data, account, purchases, onBought }) {
  const [exhibitionId, setExhibitionId] = useState(null)
  const [counts, setCounts] = useState({})
  const [visitDate, setVisitDate] = useState('')
  const [ticketPayment, setTicketPayment] = useState('')
  const [onlinePayments, setOnlinePayments] = useState([])
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [schoolEmail, setSchoolEmail] = useState('')
  const [schoolEmailOk, setSchoolEmailOk] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [studentModalError, setStudentModalError] = useState('')
  const [pendingStudentCount, setPendingStudentCount] = useState(null)
  const [pendingWaitlistJoin, setPendingWaitlistJoin] = useState(false)
  const [exhibitions, setExhibitions] = useState(data.exhibitions)

  useEffect(() => {
    callApi('/api/payment-methods?for=online', 'GET')
      .then(setOnlinePayments)
      .catch(() => setOnlinePayments([]))
  }, [])

  useEffect(() => {
    setExhibitions(data.exhibitions)
  }, [data.exhibitions])

  useEffect(() => {
    if (!visitDate) {
      setExhibitions(data.exhibitions)
      return
    }

    let cancelled = false

    callApi(
      '/api/customer/exhibitions?visitDate=' + encodeURIComponent(visitDate),
      'GET'
    )
      .then((result) => {
        if (!cancelled) {
          setExhibitions(result.exhibitions)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [visitDate, data.exhibitions])

  const { waitlist, prices, discounts, waitlistLimit } = data
  const membership = account?.membership ?? account?.Membership ?? null
  const askForStudentEmail = needsStudentEmail(membership)
  const types = Object.keys(prices)
  const selected = exhibitions.find(
    (item) => item.ExhibitionID === exhibitionId
  )
  const isWaitlistMode =
    selected !== undefined && visitDate !== '' && selected.Remaining === 0
  const myWaitlistEntries = selected
    ? waitlist.filter((entry) => entry.ExhibitionID === selected.ExhibitionID)
    : []
  const myOpenedSpots = myWaitlistEntries.filter(
    (entry) => entry.Status === 'Notified'
  ).length
  const waitlistSlotsLeft = selected
    ? Math.max(waitlistLimit - selected.WaitlistCount, 0)
    : 0

  const discountedLimit = {
    Adult: 0,
    Child: 0,
    Student: 0,
    Senior: 0,
  }

  if (membershipBenefitsActive(membership)) {
    const plan = account?.plans?.find(
      (item) => item.MembershipType === membership.MembershipType
    )
    Object.assign(discountedLimit, plan?.TicketLimits || {})
  }

  const usedDiscounts = {
    Adult: 0,
    Child: 0,
    Student: 0,
    Senior: 0,
  }

  if (visitDate && exhibitionId !== null) {
    for (const ticket of purchases?.tickets || []) {
      if (
        ticket.VisitDate === visitDate &&
        Number(ticket.ExhibitionID) === Number(exhibitionId) &&
        ticket.RefundStatus !== 'Refunded' &&
        Number(ticket.Price) < Number(prices[ticket.TicketType])
      ) {
        usedDiscounts[ticket.TicketType] = (usedDiscounts[ticket.TicketType] || 0) + 1
      }
    }
  }

  const discountsLeft = {}

  for (const type of Object.keys(discountedLimit)) {
    discountsLeft[type] = Math.max(discountedLimit[type] - (usedDiscounts[type] || 0), 0)
  }

  const priceFor = (type, index = 0) => {
    const discount = index < (discountsLeft[type] || 0)
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

  // When the only seats left are this customer's opened waitlist holds,
  // don't let them buy more tickets than spots they were offered.
  const limit = selected
    ? myOpenedSpots > 0 && selected.Remaining <= myOpenedSpots
      ? Math.min(selected.Remaining, myOpenedSpots)
      : selected.Remaining
    : 0

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
    setPendingWaitlistJoin(false)
    setStudentModalError('')
  }

  const changeTicketCount = (type, value) => {
    if (type === 'Student' && askForStudentEmail && value > 1) {
      setError('Only one Student ticket can be purchased per school email for each visit.')
      return
    }

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
    setPendingWaitlistJoin(false)
    setStudentModalError('')
    setStudentModalOpen(true)
  }

  const chooseExhibition = (id) => {
    const item = exhibitions.find(
      (exhibition) => exhibition.ExhibitionID === id
    )
    const earliest =
      item && item.StartDate > today ? item.StartDate : today

    setExhibitionId(id)
    setCounts({})
    setVisitDate(
      item && earliest <= item.EndDate ? earliest : item?.StartDate || ''
    )
    setError('')
  }

  const handleBuy = async () => {
    if (!selected) {
      setError('Please choose an exhibition.')
      return
    }

    if (isWaitlistMode) {
      await handleJoinWaitlist()
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

    if (!onlinePayments.includes(ticketPayment)) {
      setError('Please choose a payment method.')
      return
    }

    if ((counts.Student || 0) > 0 && askForStudentEmail && !schoolEmailOk) {
      setPendingStudentCount(null)
      setPendingWaitlistJoin(false)
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
        PaymentMethod: ticketPayment,
        Tickets: counts,
        SchoolEmail: askForStudentEmail ? schoolEmail : undefined,
      })

      setCounts({})
      setVisitDate('')
      setTicketPayment('')
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

  const handleJoinWaitlist = async (email) => {
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
      setError('Please choose at least one ticket for the waitlist.')
      return
    }

    if (totalCount > waitlistSlotsLeft) {
      setError('Not enough waitlist spots left for that many tickets.')
      return
    }

    if ((counts.Student || 0) > 0 && askForStudentEmail && !schoolEmailOk && !email) {
      setPendingStudentCount(null)
      setPendingWaitlistJoin(true)
      setStudentModalError('')
      setStudentModalOpen(true)
      return
    }

    setWaiting(true)
    setError('')

    try {
      const result = await callApi('/api/customer/waitlist', 'POST', {
        ExhibitionID: selected.ExhibitionID,
        VisitDate: visitDate,
        Tickets: counts,
        SchoolEmail: email || schoolEmail,
      })

      setCounts({})
      setVisitDate('')
      setExhibitionId(null)
      setSchoolEmail('')
      setSchoolEmailOk(false)

      onBought(
        `Joined the waitlist for ${result.count} ${result.count === 1 ? 'ticket' : 'tickets'}. We will let you know when a spot opens up.`
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

    if (pendingWaitlistJoin) {
      setPendingWaitlistJoin(false)
      handleJoinWaitlist(email)
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
            const daySoldOut =
              visitDate !== '' &&
              item.ExhibitionID === exhibitionId &&
              item.Remaining === 0
            const myEntries = waitlist.filter(
              (spot) => spot.ExhibitionID === item.ExhibitionID
            )
            const notified = myEntries.some((spot) => spot.Status === 'Notified')
            const remainingLabel =
              visitDate !== '' && item.ExhibitionID === exhibitionId
                ? item.Remaining === 0
                  ? ` · Sold out on ${formatDate(visitDate)} · Waitlist ${item.WaitlistCount} of ${waitlistLimit}`
                  : ` · ${item.Remaining} left on ${formatDate(visitDate)}`
                : ` · up to ${item.Capacity} per day`

            return (
              <button
                key={item.ExhibitionID}
                type="button"
                className={`cp-option${item.ExhibitionID === exhibitionId ? ' is-selected' : ''}${daySoldOut ? ' is-soldout' : ''}`}
                onClick={() => chooseExhibition(item.ExhibitionID)}
                disabled={daySoldOut && item.WaitlistFull && myEntries.length === 0}
              >
                <span className="cp-option-name">{item.Name}</span>

                {item.Description && (
                  <span className="cp-option-text">
                    {item.Description}
                  </span>
                )}

                <span className="cp-option-meta">
                  {formatDate(item.StartDate)} - {formatDate(item.EndDate)}
                  {remainingLabel}
                  {myEntries.length > 0 &&
                    ` · You have ${myEntries.length} on the waitlist`}
                  {notified && ' · A spot opened for you'}
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
        <h2>
          {isWaitlistMode
            ? 'That visit date is full - join the waitlist'
            : 'Choose tickets and visit date'}
        </h2>

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
                  setCounts({})
                  setError('')
                }}
                required
              />
            </div>

            <ul className="cp-lines">
              {types.map((type) => {
                const count = counts[type] || 0
                const memberLimit = isWaitlistMode
                  ? 0
                  : discountsLeft[type] || 0
                const memberCount = Math.min(count, memberLimit)
                const regularCount = count - memberCount
                const memberPrice = priceFor(type, 0)
                const regularPrice = prices[type]
                const available = isWaitlistMode
                  ? waitlistSlotsLeft
                  : limit
                const maxForType =
                  type === 'Student' && askForStudentEmail
                    ? Math.min(1, count + available - totalCount)
                    : count + available - totalCount

                return (
                  <li key={type} className="cp-line">
                    <div>
                      <div className="strong">{type}</div>
                      <div className="cp-price">
                        {isWaitlistMode ? (
                          'Waitlist'
                        ) : memberCount > 0 && regularCount > 0 ? (
                          <>
                            {money(memberPrice)} × {memberCount}
                            {' - '}
                            {money(regularPrice)} × {regularCount}
                          </>
                        ) : memberLimit > 0 &&
                          Number(memberPrice) < Number(regularPrice) ? (
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
                      max={Math.max(maxForType, 0)}
                      onChange={(value) => changeTicketCount(type, value)}
                    />
                  </li>
                )
              })}
            </ul>

            {!isWaitlistMode && (
              <div className="cp-total">
                <span>Total</span>
                <strong>{money(totalPrice)}</strong>
              </div>
            )}

            {!isWaitlistMode && (
              <div className="form-group">
                <label htmlFor="ticket-payment">Payment</label>
                <select
                  id="ticket-payment"
                  value={ticketPayment}
                  onChange={(event) => {
                    setTicketPayment(event.target.value)
                    setError('')
                  }}
                >
                  <option value="">Choose a payment method</option>
                  {onlinePayments.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            )}

            {!isWaitlistMode && (
              <p className="cp-note">All tickets are non-refundable.</p>
            )}

            {isWaitlistMode && myWaitlistEntries.length > 0 && (
              <p className="cp-note">
                You are already on this waitlist. Manage or leave it from
                Purchases → Waitlist.
              </p>
            )}

            {error && (
              <p className="form-error" role="alert">{error}</p>
            )}

            <button
              type="button"
              className="btn primary cp-wide"
              onClick={handleBuy}
              disabled={
                totalCount === 0 ||
                buying ||
                waiting ||
                (isWaitlistMode && waitlistSlotsLeft === 0)
              }
            >
              {isWaitlistMode
                ? waiting
                  ? 'Joining...'
                  : `Join Waitlist${totalCount > 0 ? ` (${totalCount})` : ''}`
                : buying
                  ? 'Buying...'
                  : `Buy ${totalCount || ''} ${totalCount === 1 ? 'Ticket' : 'Tickets'}`}
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
  const [onlinePayments, setOnlinePayments] = useState([])
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    callApi('/api/payment-methods?for=online', 'GET')
      .then(setOnlinePayments)
      .catch(() => setOnlinePayments([]))
  }, [])

  const membership = account?.membership ?? null
  const shopDiscount = membershipBenefitsActive(membership)
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
                    max={item.Stock}
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
                {onlinePayments.map((method) => (
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

function isRecentAlert(dateText) {
  if (!dateText) {
    return true
  }

  const stamp = new Date(`${dateText}T00:00:00`)

  if (Number.isNaN(stamp.getTime())) {
    return true
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return stamp >= cutoff
}

function cancelledExhibitionBullets(item) {
  const bullets = []

  if (item.pendingCount > 0) {
    bullets.push(
      item.pendingCount === 1
        ? '1 ticket refund pending'
        : `${item.pendingCount} ticket refunds pending`
    )
  }

  if (item.refundedCount > 0) {
    bullets.push(
      item.refundedCount === 1
        ? `${money(item.refundedTotal)} refunded (1 ticket)`
        : `${money(item.refundedTotal)} refunded (${item.refundedCount} tickets)`
    )
  }

  if (item.waitlistCount > 0) {
    bullets.push(
      item.waitlistCount === 1
        ? '1 waitlist spot removed'
        : `${item.waitlistCount} waitlist spots removed`
    )
  }

  return bullets
}

function CancelledExhibitionNotice({ item }) {
  const bullets = cancelledExhibitionBullets(item)

  return (
    <div className="cp-alert-block">
      <p className="cp-alert-title">
        <strong>{item.name}</strong> was cancelled
      </p>
      {item.reason && (
        <p className="cp-alert-reason">Reason: {item.reason}</p>
      )}
      {bullets.length > 0 && (
        <ul className="cp-alert-bullets">
          {bullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RefundGroupNotice({ group }) {
  return (
    <div className="cp-alert-block">
      <p className="cp-alert-title">
        <strong>{group.name}</strong> refund processed
      </p>
      <ul className="cp-alert-bullets">
        <li>
          {group.count === 1
            ? `${money(group.total)} refunded (1 ticket)`
            : `${money(group.total)} refunded (${group.count} tickets)`}
        </li>
      </ul>
    </div>
  )
}

function buildCancelledExhibitionAlerts(purchases, alertAcks) {
  const byId = new Map()

  const ensure = (id, name, reason) => {
    if (alertAcks.exhibitions.includes(id)) {
      return null
    }

    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name,
        reason: reason || 'Exhibition cancelled by administration',
        pendingCount: 0,
        refundedCount: 0,
        refundedTotal: 0,
        waitlistCount: 0,
        fromNotifiedTickets: false,
        refundTicketIds: [],
      })
    }

    return byId.get(id)
  }

  for (const ticket of purchases.tickets || []) {
    if (!ticket.CancelledAt || !isRecentAlert(ticket.UpdatedAt || ticket.CancelledAt)) {
      continue
    }

    const exhibitionId = Number(ticket.ExhibitionID)
    const pendingNotice =
      ticket.RefundStatus === 'Pending' && ticket.NotificationStatus === 'Sent'
    const refundedNotice =
      ticket.MuseumRefund && !alertAcks.refunds.includes(Number(ticket.TicketID))

    if (!pendingNotice && !refundedNotice) {
      continue
    }

    const item = ensure(
      exhibitionId,
      ticket.ExhibitionName,
      ticket.CancellationReason
    )

    if (!item) {
      continue
    }

    if (pendingNotice) {
      item.pendingCount += 1
      item.fromNotifiedTickets = true
    }

    if (refundedNotice) {
      item.refundedCount += 1
      item.refundedTotal += Number(ticket.Price) || 0
      item.refundTicketIds.push(Number(ticket.TicketID))
      item.fromNotifiedTickets = true
    }
  }

  for (const entry of purchases.waitlist || []) {
    if (entry.Status !== 'Cancelled' || !entry.ExhibitionCancelled) {
      continue
    }

    if (!isRecentAlert(entry.CancelledAt)) {
      continue
    }

    const exhibitionId = Number(entry.ExhibitionID)
    const hasTickets = (purchases.tickets || []).some(
      (ticket) => Number(ticket.ExhibitionID) === exhibitionId
    )
    const item = ensure(
      exhibitionId,
      entry.ExhibitionName,
      entry.CancellationReason
    )

    if (!item) {
      continue
    }

    // Ticket holders get one combined notice after staff sends cancel notifications.
    if (hasTickets && !item.fromNotifiedTickets) {
      continue
    }

    item.waitlistCount += 1
  }

  return Array.from(byId.values()).filter(
    (item) =>
      item.pendingCount > 0 || item.refundedCount > 0 || item.waitlistCount > 0
  )
}

function buildStandaloneRefundAlerts(purchases, alertAcks, cancelledIds) {
  const byExhibition = new Map()

  for (const ticket of purchases.tickets || []) {
    const exhibitionId = Number(ticket.ExhibitionID)

    if (cancelledIds.has(exhibitionId)) {
      continue
    }

    if (
      !ticket.MuseumRefund ||
      !isRecentAlert(ticket.UpdatedAt) ||
      alertAcks.refunds.includes(Number(ticket.TicketID))
    ) {
      continue
    }

    if (!byExhibition.has(exhibitionId)) {
      byExhibition.set(exhibitionId, {
        id: exhibitionId,
        name: ticket.ExhibitionName || 'Ticket',
        count: 0,
        total: 0,
        refundTicketIds: [],
      })
    }

    const item = byExhibition.get(exhibitionId)
    item.count += 1
    item.total += Number(ticket.Price) || 0
    item.refundTicketIds.push(Number(ticket.TicketID))
  }

  return Array.from(byExhibition.values())
}

function groupOpenedSpots(waitlist) {
  const groups = new Map()

  for (const entry of waitlist || []) {
    if (entry.Status !== 'Notified') {
      continue
    }

    const id = Number(entry.ExhibitionID)

    if (!groups.has(id)) {
      groups.set(id, {
        ExhibitionID: id,
        ExhibitionName: entry.ExhibitionName,
        count: 0,
      })
    }

    groups.get(id).count += 1
  }

  return Array.from(groups.values())
}

function Notices({ purchases, waitlist, alertAcks, onGo }) {
  const cancelled = buildCancelledExhibitionAlerts(purchases, alertAcks)
  const openSpots = groupOpenedSpots(waitlist)

  if (cancelled.length === 0 && openSpots.length === 0) {
    return null
  }

  return (
    <div className="cp-notices">
      {cancelled.map((item) => (
        <div key={item.id} className="cp-notice" role="status">
          <CancelledExhibitionNotice item={item} />
        </div>
      ))}

      {openSpots.map((item) => (
        <div key={item.ExhibitionID} className="cp-notice" role="status">
          <p className="cp-alert-title">
            {item.count === 1
              ? '1 spot opened for '
              : `${item.count} spots opened for `}
            <strong>{item.ExhibitionName}</strong>
          </p>
          <span className="cp-notice-actions">
            <button type="button" className="btn secondary" onClick={onGo}>
              Buy Tickets
            </button>
          </span>
        </div>
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

  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [customerAlerts, setCustomerAlerts] = useState({
    cancelledExhibitions: [],
    refundedGroups: [],
  })
  const [alertAcks, setAlertAcks] = useState({ exhibitions: [], refunds: [] })
  const [acksLoaded, setAcksLoaded] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)

  const loadAll = useCallback(async () => {
    try {
      const [accountData, exhibitionData, items, purchaseData, ackData] = await Promise.all([
        callApi('/api/customer/account', 'GET'),
        callApi('/api/customer/exhibitions', 'GET'),
        callApi('/api/customer/shop', 'GET'),
        callApi('/api/customer/purchases', 'GET'),
        callApi('/api/customer/alert-acks', 'GET'),
      ])

      setAccount(accountData)
      setTicketData(exhibitionData)
      setShopItems(items)
      setPurchases(purchaseData)
      setAlertAcks({
        exhibitions: (ackData.exhibitions || []).map(Number),
        refunds: (ackData.refunds || []).map(Number),
      })
      setAcksLoaded(true)
      setLoadError('')
    }
    catch (error) {
      setLoadError(error.message)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!purchases || !ticketData || !acksLoaded) return

    const cancelled = buildCancelledExhibitionAlerts(purchases, alertAcks)
    const cancelledIds = new Set(cancelled.map((item) => item.id))
    const refundedGroups = buildStandaloneRefundAlerts(
      purchases,
      alertAcks,
      cancelledIds
    )

    if (cancelled.length > 0 || refundedGroups.length > 0) {
      setCustomerAlerts({
        cancelledExhibitions: cancelled,
        refundedGroups: refundedGroups,
      })
      setCustomerModalOpen(true)
    } else {
      setCustomerModalOpen(false)
    }
  }, [purchases, ticketData, alertAcks, acksLoaded])

  const handleAcknowledgeAlerts = async () => {
    if (acknowledging) {
      return
    }

    setAcknowledging(true)

    const refundIds = [
      ...customerAlerts.cancelledExhibitions.flatMap(
        (ex) => ex.refundTicketIds || []
      ),
      ...customerAlerts.refundedGroups.flatMap(
        (group) => group.refundTicketIds || []
      ),
    ]

    try {
      const nextAcks = await callApi('/api/customer/alert-acks', 'POST', {
        exhibitions: customerAlerts.cancelledExhibitions.map((ex) => ex.id),
        refunds: refundIds,
      })

      setAlertAcks({
        exhibitions: (nextAcks.exhibitions || []).map(Number),
        refunds: (nextAcks.refunds || []).map(Number),
      })
      setCustomerModalOpen(false)
    } catch (error) {
      setMessage(error.message)
      setCustomerModalOpen(false)
    } finally {
      setAcknowledging(false)
    }
  }

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

      {purchases && ticketData && acksLoaded && (
        <Notices
          purchases={purchases}
          waitlist={ticketData.waitlist}
          alertAcks={alertAcks}
          onGo={() => switchTab('tickets')}
        />
      )}

      {loadError && (
        <p className="form-error" role="alert">Could not load your account: {loadError}</p>
      )}

      {!loadError && account === null && <p className="cp-empty">Loading...</p>}

      {account && tab === 'membership' && (
        <MembershipTab
          account={account}
          waitlist={
            (purchases?.waitlist?.length
              ? purchases.waitlist
              : ticketData?.waitlist) || []
          }
          onBuyTickets={() => switchTab('tickets')}
          onChanged={handleBought}
        />
      )}
      {ticketData && tab === 'tickets' && <TicketsTab data={ticketData} account={account} purchases={purchases} onBought={handleBought} />}
      {shopItems && tab === 'shop' && (
        <ShopTab items={shopItems} account={account} onBought={handleBought} />
      )}
      {purchases && tab === 'purchases' && (
        <PurchasesTab purchases={purchases} onChanged={handleBought} />
      )}
      {account && tab === 'details' && <DetailsTab account={account} onUpdated={handleBought} />}

      <Modal
        open={customerModalOpen}
        title="Account Notice"
        onClose={handleAcknowledgeAlerts}
      >
        <div className="cp-alert-modal">
          {customerAlerts.cancelledExhibitions.map((ex) => (
            <CancelledExhibitionNotice key={`cancel-${ex.id}`} item={ex} />
          ))}
          {customerAlerts.refundedGroups.map((group) => (
            <RefundGroupNotice key={`refund-${group.id}`} group={group} />
          ))}

          <div className="form-actions">
            <button
              type="button"
              className="btn primary"
              onClick={handleAcknowledgeAlerts}
              disabled={acknowledging}
            >
              {acknowledging ? 'Saving...' : 'Got it'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerPage