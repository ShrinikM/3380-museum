
import { Link } from 'react-router-dom'

function Card({ title, description, count, link }) {
  return (
    <Link to={link} className="card module-card">
      <div className="module-top">
        <span className="module-count">{count}</span>
      </div>

      <div className="module-title">{title}</div>
      <p className="module-desc">{description}</p>

      <div className="module-link">Click to view</div>
    </Link>
  )
}

export default Card
