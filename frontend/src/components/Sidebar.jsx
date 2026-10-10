import{ NavLink } from 'react-router-dom'
import{
  DashboardIcon, ArtistIcon, ArtworkIcon, CollectionIcon, ExhibitionIcon,
  TicketIcon, MemberIcon, GiftIcon, CafeIcon, DonationIcon, StaffIcon,
} from './Icons'

const SECTIONS = [
  { label: 'Overview', items: [
    { to: '/', text: 'Dashboard', Icon: DashboardIcon },
  ]},
  { label: 'Collection', items: [
    { to: '/artists', text: 'Artists', Icon: ArtistIcon },
    { to: '/artworks', text: 'Artworks', Icon: ArtworkIcon },
    { to: '/collections', text: 'Collections', Icon: CollectionIcon },
    { to: '/exhibitions', text: 'Exhibitions', Icon: ExhibitionIcon },
  ]},
  { label: 'Operations', items: [
    { to: '/tickets', text: 'Tickets', Icon: TicketIcon },
    { to: '/memberships', text: 'Memberships', Icon: MemberIcon },
    { to: '/gift-shop', text: 'Gift Shop', Icon: GiftIcon },
    { to: '/cafe', text: 'Café', Icon: CafeIcon },
  ]},
  { label: 'Administration', items: [
    { to: '/donations', text: 'Donations', Icon: DonationIcon },
    { to: '/staff', text: 'Staff', Icon: StaffIcon },
  ]},
]

function Sidebar(){
  return(
    <aside className="sidebar">
      <nav>
        {SECTIONS.map((section)=>(
          <div className="sidebar-section" key={section.label}>
            <div className="sidebar-label">{section.label}</div>

            {section.items.map(({ to, text, Icon })=>(
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive })=> 'sidebar-link' + (isActive ? ' active' : '')}>
                <Icon size={14} />
                {text}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar