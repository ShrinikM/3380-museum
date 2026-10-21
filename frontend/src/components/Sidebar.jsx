import { NavLink } from 'react-router-dom'
import { useRole } from '../context/role'

const SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', text: 'Dashboard' },
    ],
  },
  {
    label: 'Collection',
    items: [
      { to: '/artists', text: 'Artists' },
      { to: '/artworks', text: 'Artworks' },
      { to: '/collections', text: 'Collections' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/exhibitions', text: 'Exhibitions' },
      { to: '/tickets', text: 'Tickets' },
      { to: '/memberships', text: 'Memberships' },
      { to: '/gift-shop', text: 'Gift Shop' },
      { to: '/cafe', text: 'Café' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports', text: 'Reports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/donations', text: 'Donations' },
      { to: '/staff', text: 'Staff' },
    ],
  },
]

function Sidebar() {
  const { canView } = useRole()

  return (
    <aside className="sidebar">
      <nav>
        {SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            canView(item.to)
          )

          if (visibleItems.length === 0) return null

          return (
            <div className="sidebar-section" key={section.label}>
              <div className="sidebar-label">{section.label}</div>

              {visibleItems.map(({ to, text }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    'sidebar-link' + (isActive ? ' active' : '')
                  }
                >
                  {text}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
