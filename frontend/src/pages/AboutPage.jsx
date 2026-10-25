import { Link } from 'react-router-dom'
import { useRole } from '../context/role'
import { DEFAULT_TICKET_PRICES, DEFAULT_MEMBERSHIP_PRICES } from '../data/constants'
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

// Same prices and discounts as membershipPlans in backend/prices.js
const PLANS = [
  {
    type: 'Individual',
    price: 75,
    discount: 5,
    perks: ['Free entry to the permanent collection', 'Early booking for new exhibitions'],
  },
  {
    type: 'Family',
    price: 150,
    discount: 10,
    perks: ['Everything in Individual', 'Children always visit free'],
  },
  {
    type: 'Student',
    price: 40,
    discount: 10,
    perks: ['Everything in Individual', 'Lowest yearly price'],
  },
  {
    type: 'Senior',
    price: 60,
    discount: 15,
    perks: ['Everything in Individual', 'Our biggest ticket discount'],
  },
]

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function formatPrice(value){
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

// Customers go straight to their account tab, everyone else logs in first
function useAccountLink(tab){
  const { user } = useRole()
  const isCustomer = user !== null && user.role === 'Customer'
  return isCustomer ? `/account?tab=${tab}` : `/login?tab=${tab}`
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

function MembershipPlans(){
  const to = useAccountLink('membership')

  return (
    <section className="ab-plans">
      <div className="ab-plans-head">
        <div className="ab-label">Membership</div>
        <h2>Choose a membership</h2>
        <p>Every plan lasts one year and includes a discount on all exhibition tickets.</p>
      </div>

      <div className="ab-plan-grid">
        {PLANS.map((plan)=>(
          <article key={plan.type} className="ab-plan">
            <div className="ab-plan-top">
              <h3>{plan.type}</h3>
              <span className="ab-plan-price">${plan.price}</span>
            </div>

            <p className="ab-plan-intro">{plan.intro}</p>

            <ul className="ab-plan-perks">
              <li><strong>{plan.discount}% off</strong> every ticket</li>
              {plan.perks.map((perk)=>(
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
          {Object.entries(DEFAULT_TICKET_PRICES).map(([type, price])=>(
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
          {Object.entries(DEFAULT_MEMBERSHIP_PRICES).map(([type, price])=>(
            <li key={type} className="ab-row">
              <span>{type}</span>
              <span className="ab-price">
                {formatPrice(price)}
                <span className="ab-suffix">/ </span>
              </span>
            </li>
          ))}
        </InfoCard>
      </div>

      <MembershipPlans />
    </div>
  )
}

export default AboutPage