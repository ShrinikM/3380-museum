import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/role'
import { callApi } from '../api'
import './AboutPage.css'
import './Plans.css'


const MUSEUM = {
  name: 'CoogMuseum',
  street: '4800 Calhoun Rd',
  city: 'Houston, TX 77004',
  phone: '(713) 555-0142',
  email: 'info@coogmuseum.org',
  parking: 'Free visitor parking.',
}

const HOURS = [
  { day: 'Monday', time: '10 am - 5 pm' },
  { day: 'Tuesday', time: '10 am - 5 pm' },
  { day: 'Wednesday', time: '10 am - 5 pm' },
  { day: 'Thursday', time: '10 am - 5 pm' },
  { day: 'Friday', time: '10 am - 5 pm' },
  { day: 'Saturday', time: '12 am - 9 pm' },
  { day: 'Sunday', time: '12 pm - 9 pm' },
]

const PLAN_DETAILS = {
  Dual: {
    ticketPerk: (percent) => `2 Adult tickets at ${percent}% off`,
    extras: [],
  },
  Family: {
    ticketPerk: (percent) => `2 Adult and 2 Child tickets at ${percent}% off`,
    extras: ['Children under 5 always visit free'],
  },
  Student: {
    ticketPerk: (percent) => `2 Student tickets at ${percent}% off`,
    extras: ['Lowest yearly price'],
  },
  Senior: {
    ticketPerk: (percent) => `2 Senior tickets at ${percent}% off`,
    extras: ['For visitors 65 and older'],
  },
}

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function formatPrice(value){
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

function planPerks(plan){
  const details = PLAN_DETAILS[plan.MembershipType] || {
    ticketPerk: (percent) => `Exhibition tickets at ${percent}% off`,
    extras: [],
  }

  return [
    details.ticketPerk(plan.DiscountPercent),
    `${plan.CafeDiscount}% off CoogCafe`,
    `${plan.GiftShopDiscount}% off gift shop items`,
    ...details.extras,
  ]
}

function useAccountLink(tab){
  const { user } = useRole()
  const isCustomer = user !== null && user.role === 'Customer'
  return isCustomer ? `/account?tab=${tab}` : `/login?mode=register&tab=${tab}`
}

function InfoCard({ label, title, children, note, action, tab }){
  const to = useAccountLink(tab)

  return (
    <section className="ab-card">
      <div className="ab-label">{label}</div>
      <h2>{title}</h2>
      <ul className="ab-list">{children}</ul>
      {note && <p className="ab-note">{note}</p>}
      {action && (
        <Link to={to} className="btn primary ab-action">
          {action}
        </Link>
      )}
    </section>
  )
}

function MembershipPlans({ plans }){
  const to = useAccountLink('membership')

  if (plans.length === 0) {
    return null
  }

  return (
    <section className="ab-plans">
      <div className="ab-plans-head">
        <div className="ab-label">Membership</div>
        <h2>Choose a membership</h2>
        <p>Every plan lasts one year and includes a discount on exhibition tickets. Member discounts can be used once per exhibition per visit day.</p>
      </div>

      <div className="ab-plan-grid">
        {plans.map((plan)=>(
          <article key={plan.MembershipType} className="ab-plan">
            <div className="ab-plan-top">
              <h3>{plan.MembershipType}</h3>
              <span className="ab-plan-price">{formatPrice(plan.Price)}</span>
            </div>

            <ul className="ab-plan-perks">
              {planPerks(plan).map((perk)=>(
                <li key={perk}>{perk}</li>
              ))}
            </ul>

            <Link to={to} className="btn primary ab-plan-btn">
              Join
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function AboutPage(){
  const today = HOURS[(new Date().getDay() + 6) % 7]
  const isOpen = today.time !== 'Closed'
  const [membershipPlans, setMembershipPlans] = useState([])
  const [ticketPrices, setTicketPrices] = useState({})

  useEffect(() => {
    callApi('/api/membership-prices', 'GET')
      .then((data) => setMembershipPlans(data))
      .catch(() => setMembershipPlans([]))

    callApi('/api/ticket-prices', 'GET')
      .then((data) => setTicketPrices(data))
      .catch(() => setTicketPrices({}))
  }, [])

  return (
    <div className="ab-page">
      <section className="ab-hero">
        <div className="ab-hero-text">
          <div className="ab-label">About the museum</div>
          <h1>Art for everyone, right here in Houston.</h1>
          <p>
            {MUSEUM.name} collects and exhibits art from many periods and places,
            from ancient sculpture to modern prints. Here is everything you need
            to plan a visit.
          </p>

          <div className={`ab-status${isOpen ? ' is-open' : ''}`}>
            <span className="ab-dot" />
            {isOpen ? `Open today, ${today.time}` : 'Closed today'}
          </div>
        </div>

        <div className="ab-hero-panel">
          <span
            className="ab-hand"
            style={{ WebkitMaskImage: `url(${HAND})`, maskImage: `url(${HAND})` }}
            aria-hidden="true"
          />
          <div className="ab-panel-text">
            <strong>Go Coogs</strong>
          </div>
        </div>
      </section>

      <div className="ab-info">
        <InfoCard label="Plan your visit" title="Hours">
          {HOURS.map((row)=>(
            <li
              key={row.day}
              className={`ab-row${row.day === today.day ? ' is-today' : ''}`}
            >
              <span>{row.day}</span>
              <span className={row.time === 'Closed' ? 'ab-closed' : ''}>
                {row.time}
              </span>
            </li>
          ))}
        </InfoCard>

        <InfoCard
          label="Tickets"
          title="Admission"
          action="Buy Tickets"
          tab="tickets"
        >
          {Object.entries(ticketPrices).map(([type, price])=>(
            <li key={type} className="ab-row">
              <span>{type}</span>
              <span className="ab-price">{formatPrice(price)}</span>
            </li>
          ))}
        </InfoCard>

        <InfoCard
          label="Support us"
          title="Membership"
          action="Become a Member"
          tab="membership"
        >
          {membershipPlans.map((plan)=>(
            <li key={plan.MembershipType} className="ab-row">
              <span>{plan.MembershipType}</span>
              <span className="ab-price">
                {formatPrice(plan.Price)}
                <span className="ab-suffix">/ year</span>
              </span>
            </li>
          ))}
        </InfoCard>
      </div>

      <MembershipPlans plans={membershipPlans} />
    </div>
  )
}

export default AboutPage
