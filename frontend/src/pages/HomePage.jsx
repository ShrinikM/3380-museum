
import { NavLink } from 'react-router-dom'
import { useRole } from '../context/role'

const shortcuts = [
  {
    to: '/artworks',
    title: 'Artworks',
    description: 'Explore and manage the museum artwork collection.',
  },
  {
    to: '/artists',
    title: 'Artists',
    description: 'Discover the people behind the artwork.',
  },
  {
    to: '/collections',
    title: 'Collections',
    description: 'Browse and organize museum collections.',
  },
  {
    to: '/exhibitions',
    title: 'Exhibitions',
    description: 'Manage exhibitions and featured collections.',
  },
  {
    to: '/tickets',
    title: 'Tickets',
    description: 'Access ticketing and visitor services.',
  },
  {
    to: '/reports',
    title: 'Reports',
    description: 'Review museum activity and reports.',
  },
]

function HomePage() {
  const { user, canView } = useRole()

  const availableShortcuts = shortcuts.filter((item) =>
    canView(item.to)
  )

  return (
    <div className="page home-page">
      <header className="page-header">
        <div>
          <div className="section-label">COOGMUSEUM · COLLECTION & CULTURE</div>
          <h1 className="page-title">
            Welcome{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="page-subtitle">
            Explore the people, artwork, and exhibitions that
            bring our museum to life.
          </p>
        </div>
      </header>

      <section className="home-welcome card">
        <div className="home-welcome-copy">
          <span className="badge badge-individual">YOUR MUSEUM WORKSPACE</span>
          <h2>Art has a place. So do you.</h2>
          <p>
            Everything you need to help keep the museum's collections,
            artists, and exhibitions connected in one place.
          </p>

          <div className="home-actions">
            {canView('/artworks') && (
              <NavLink to="/artworks" className="btn primary">
                Explore artworks
              </NavLink>
            )}

            {canView('/exhibitions') && (
              <NavLink to="/exhibitions" className="btn secondary">
                View exhibitions
              </NavLink>
            )}
          </div>
        </div>

        <div className="home-welcome-image">
          <img
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=85"
            alt="Artwork displayed in an art gallery"
          />
        </div>
      </section>

      <section className="home-sections">
        <div className="home-section-header">
          <div>
            <h2 className="home-heading">Museum sections</h2>
            <p className="page-subtitle">
              Quick access to the areas available to your role.
            </p>
          </div>
        </div>

        <div className="module-grid home-module-grid">
          {availableShortcuts.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="module-card"
            >
              <div className="module-top">
                <span className="module-count">{item.number}</span>
              </div>

              <h3 className="module-title">{item.title}</h3>
              <p className="module-desc">{item.description}</p>
              <span className="module-link">Open section</span>
            </NavLink>
          ))}
        </div>

        {availableShortcuts.length === 0 && (
          <div className="card home-empty">
            No sections are currently available for your role.
          </div>
        )}
      </section>

      <section className="home-footer card">
        <div>
          <h2>Keep the stories moving.</h2>
          <p className="page-subtitle">
            Every artwork, artist, and exhibition adds to the museum's story.
          </p>
        </div>

        {canView('/collections') && (
          <NavLink to="/collections" className="btn primary">
            Browse collections
          </NavLink>
        )}
      </section>
    </div>
  )
}

export default HomePage
