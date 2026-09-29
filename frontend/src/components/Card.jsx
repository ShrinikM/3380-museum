function Card({ title, description, link, linkText = 'View →' }) {
  return (
    <div className="dashboard-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <a href={link}>{linkText}</a>
    </div>
  )
}

export default Card