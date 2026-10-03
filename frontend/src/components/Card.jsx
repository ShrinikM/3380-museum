import{ Link } from 'react-router-dom'
import{ ChevronRightIcon } from './Icons'

function Card({ title, description, count, Icon, link }){
  return(
    <Link to={link} className="card module-card">
      <div className="module-top">
        <span className="icon-tile"><Icon size={15} /></span>
        <span className="module-count">{count}</span>
      </div>
      <div className="module-title">{title}</div>
      <p className="module-desc">{description}</p>
      <div className="module-link">View <ChevronRightIcon size={12} /></div>
    </Link>
  )
}

export default Card