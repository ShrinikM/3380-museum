import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/role'
import { callApi } from '../api'
import './HomePage.css'

const IMAGES = `${import.meta.env.BASE_URL}images/`

const WORKS = [
  { title: 'The Scream', artist: 'Edvard Munch', year: '1893', medium: 'Tempera and oil on cardboard', file: 'the-scream.jpeg' },
  { title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: '1665', medium: 'Oil on canvas', file: 'pearl-earring.jpeg' },
  { title: 'The Kiss', artist: 'Gustav Klimt', year: '1908', medium: 'Oil and gold leaf on canvas', file: 'the-kiss.jpeg' },
  { title: 'Las Meninas', artist: 'Diego Velázquez', year: '1656', medium: 'Oil on canvas', file: 'las-meninas.jpeg' },
  { title: 'The School of Athens', artist: 'Raphael', year: '1509 - 1511', medium: 'Fresco', file: 'athens.jpeg' },
  { title: 'The Dance Class', artist: 'Edgar Degas', year: '1874', medium: 'Oil on canvas', file: 'dance-class.jpeg' },
  { title: 'Marie Antoinette with a Rose', artist: 'Élisabeth Louise Vigée Le Brun', year: '1783', medium: 'Oil on canvas', file: 'rose.jpeg' },
  { title: 'The Last Supper', artist: 'Leonardo da Vinci', year: '1498', medium: 'Tempera and oil', file: 'last-supper.jpeg' },
]

const DAY = Math.floor(Date.now() / 86400000)
const WORK_OF_THE_DAY = WORKS[DAY % WORKS.length]

function useAccountLink(tab){
  const { user } = useRole()
  const isCustomer = user !== null && user.role === 'Customer'
  return isCustomer ? `/account?tab=${tab}` : `/login?mode=register&tab=${tab}`
}

function localToday(){
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function formatDate(value){
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function useExhibitions(){
  const [exhibitions, setExhibitions] = useState([])

  useEffect(()=>{
    let cancelled = false
    const today = localToday()

    callApi('/api/exhibitions', 'GET')
      .then((rows)=>{
        if(cancelled){
          return
        }

        const visible = rows
          .filter((row)=>!row.CancelledAt && row.EndDate >= today)
          .map((row)=>({ ...row, isOpen: row.StartDate <= today }))
          .sort((a, b)=>(b.isOpen - a.isOpen) || a.StartDate.localeCompare(b.StartDate))

        setExhibitions(visible.slice(0, 3))
      })
      .catch(()=>{
      })

    return ()=>{
      cancelled = true
    }
  }, [])

  return exhibitions
}

function HomePage(){
  const ticketsLink = useAccountLink('tickets')
  const membershipLink = useAccountLink('membership')
  const exhibitions = useExhibitions()

  return (
    <div className="hm-page">
      <section
        className="hm-hero"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(20, 18, 24, 0.78), rgba(20, 18, 24, 0.15) 65%), url(${IMAGES}starry-night.jpeg)`,
        }}
      >
        <div className="hm-hero-text">
          <h1>CoogMuseum</h1>
          <p>Paintings, sculpture and prints from around the world, in the heart of Houston.</p>

          <div className="hm-actions">
            <Link to={ticketsLink} className="btn primary">Buy Tickets</Link>
            <Link to="/gallery" className="btn hm-btn-light">Browse Gallery</Link>
          </div>
        </div>
      </section>

      <section className="hm-facts">
        <div>
          <span>Location</span>
          <strong>4800 Calhoun Rd, Houston</strong>
        </div>
        <div>
          <span>Admission</span>
          <strong>From $15</strong>
        </div>
        <div>
          <span>Hours</span>
          <Link to="/about">See opening hours</Link>
        </div>
      </section>

      {exhibitions.length > 0 && (
        <section className="hm-section">
          <div className="hm-section-head">
            <h2>On view</h2>
            <Link to={ticketsLink} className="hm-link">Get tickets</Link>
          </div>

          <div className="hm-shows">
            {exhibitions.map((show)=>(
              <article key={show.ExhibitionID} className="hm-show">
                <span className={`hm-tag${show.isOpen ? ' is-open' : ''}`}>
                  {show.isOpen ? 'Open now' : `Opens ${formatDate(show.StartDate)}`}
                </span>
                <h3>{show.Name}</h3>
                {show.Description && <p>{show.Description}</p>}
                <div className="hm-show-dates">
                  {formatDate(show.StartDate)} - {formatDate(show.EndDate)}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="hm-section">
        <div className="hm-daily">
          <img
            src={IMAGES + WORK_OF_THE_DAY.file}
            alt={`${WORK_OF_THE_DAY.title} by ${WORK_OF_THE_DAY.artist}`}
          />

          <div className="hm-daily-text">
            <div className="hm-label">Artwork of the day</div>
            <h2>{WORK_OF_THE_DAY.title}</h2>
            <p className="hm-daily-artist">{WORK_OF_THE_DAY.artist}, {WORK_OF_THE_DAY.year}</p>
            <p className="hm-daily-medium">{WORK_OF_THE_DAY.medium}</p>
            <Link to="/gallery" className="btn secondary">See it in the gallery</Link>
          </div>
        </div>
      </section>

      <section className="hm-section">
        <div className="hm-section-head">
          <h2>From the collection</h2>
          <Link to="/gallery" className="hm-link">View all</Link>
        </div>

        <div className="hm-strip">
          {WORKS.map((art)=>(
            <Link key={art.file} to="/gallery" className="hm-art">
              <img src={IMAGES + art.file} alt={`${art.title} by ${art.artist}`} loading="lazy" />
              <strong>{art.title}</strong>
              <span>{art.artist}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="hm-section">
        <div className="hm-duo">
          <div className="hm-duo-member">
            <div className="hm-label">Membership</div>
            <h2>Become a member</h2>
            <p>Save up to 15% on every ticket, all year long.</p>
            <Link to={membershipLink} className="btn hm-btn-light">Join Now</Link>
          </div>

          <div
            className="hm-duo-give"
            style={{ backgroundImage: `linear-gradient(rgba(20, 18, 24, 0.55), rgba(20, 18, 24, 0.7)), url(${IMAGES}terrace.jpeg)` }}
          >
            <div className="hm-label">Support the museum</div>
            <h2>Every gift helps</h2>
            <p>Donations help us care for the collection and bring new exhibitions to Houston.</p>
            <Link to="/donate" className="btn primary">Donate</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage