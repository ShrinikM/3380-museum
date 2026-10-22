import { DEFAULT_TICKET_PRICES, DEFAULT_MEMBERSHIP_PRICES } from '../data/constants'
import './AboutPage.css'
 

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
 
const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`
 
function formatPrice(value){
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}
 
function InfoCard({ label, title, children, note }){
  return (
    <section className="ab-card">
      <div className="ab-label">{label}</div>
      <h2>{title}</h2>
      <ul className="ab-list">{children}</ul>
      {note && <p className="ab-note">{note}</p>}
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
          note="Tickets are sold at the front desk."
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
          note="Members get discounted tickets on every visit."
        >
          {Object.entries(DEFAULT_MEMBERSHIP_PRICES).map(([type, price])=>(
            <li key={type} className="ab-row">
              <span>{type}</span>
              <span className="ab-price">
                {formatPrice(price)}
                <span className="ab-suffix">/ year</span>
              </span>
            </li>
          ))}
        </InfoCard>
      </div>
 
      <section className="ab-contact">
        <div>
          <h3>Address</h3>
          <p>{MUSEUM.street}<br />{MUSEUM.city}</p>
        </div>
 
        <div>
          <h3>Phone</h3>
          <a href={`tel:${MUSEUM.phone.replace(/[^0-9]/g, '')}`}>{MUSEUM.phone}</a>
        </div>
 
        <div>
          <h3>Email</h3>
          <a href={`mailto:${MUSEUM.email}`}>{MUSEUM.email}</a>
        </div>
 
        <div>
          <h3>Parking</h3>
          <p>{MUSEUM.parking}</p>
        </div>
      </section>
    </div>
  )
}
 
export default AboutPage