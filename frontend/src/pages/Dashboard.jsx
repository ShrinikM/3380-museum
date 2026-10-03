import Card from '../components/Card'
import{ StatCard } from '../components/ui'
import{
  ArtistIcon, ArtworkIcon, CollectionIcon, ExhibitionIcon,
  TicketIcon, MemberIcon, GiftIcon, DonationIcon, StaffIcon,
} from '../components/Icons'

const modules = [
  { link: '/artists', title: 'Artists', Icon: ArtistIcon, count: '2,841',
    description: 'Artist profiles, life dates, and nationality records.' },
  { link: '/artworks', title: 'Artworks', Icon: ArtworkIcon, count: '67,432',
    description: 'Catalog entries with artist, type, year, and collection.' },
  { link: '/collections', title: 'Collections', Icon: CollectionIcon, count: '184',
    description: 'Thematic groupings of the permanent collection.' },
  { link: '/exhibitions', title: 'Exhibitions', Icon: ExhibitionIcon, count: '8 active',
    description: 'Exhibition schedule, capacity, staff, and artworks.' },
  { link: '/tickets', title: 'Tickets', Icon: TicketIcon, count: '12,847',
    description: 'Ticket sales by exhibition, type, and membership.' },
  { link: '/memberships', title: 'Memberships', Icon: MemberIcon, count: '4,291',
    description: 'Member records, membership periods, and discounts.' },
  { link: '/gift-shop', title: 'Gift Shop & Café', Icon: GiftIcon, count: '1,204 items',
    description: 'Retail inventory, café menu items, and sales records.' },
  { link: '/donations', title: 'Donations', Icon: DonationIcon, count: '$4.2M YTD',
    description: 'Donor gifts, amounts, and payment methods.' },
  { link: '/staff', title: 'Staff', Icon: StaffIcon, count: '312',
    description: 'Staff directory, roles, departments, and contacts.' },
]

const activity = [
  { action: 'New membership registered', detail: 'Patricia Holloway - Senior Member', time: 'Today, 9:14 AM' },
  { action: 'Ticket batch processed', detail: '420 tickets - Jasper Johns: Mind/Mirror', time: 'Today, 8:52 AM' },
  { action: 'Exhibition updated', detail: 'Staff assignment - K. Martinez added', time: 'Today, 8:31 AM' },
  { action: 'Artwork record updated', detail: 'Artwork #2019 - collection updated', time: 'Yesterday' },
  { action: 'Donation recorded', detail: 'Anonymous - $25,000 to Acquisition Fund', time: 'Yesterday' },
]

function Dashboard(){
  return(
    <div className="page">
      <div className="dashboard-header">
        <h1>Museum Database</h1>
        <p>Welcome to the Museum of Fine Arts, Houston database.</p>
      </div>

      <div className="grid-4 section-gap">
        <StatCard label="Total Artworks" value="67,432" delta="↑ 142" deltaLabel="this quarter" />
        <StatCard label="Active Exhibitions" value="8" delta="↑ 2" deltaLabel="since last month" />
        <StatCard label="Tickets Sold" value="12,847" delta="↑ 1,204" deltaLabel="this month" />
        <StatCard label="Active Memberships" value="4,291" delta="↑ 87" deltaLabel="this month" />
      </div>

      <div className="dashboard-body">
        <section>
          <div className="section-label">Database Modules</div>
          <div className="module-grid">
            {modules.map((m)=> <Card key={m.title} {...m} />)}
          </div>
        </section>

        <aside>
          <div className="section-label">Recent Activity</div>
          <div className="card">
            {activity.map((item, i)=>(
              <div className="activity-item" key={i}>
                <span className="activity-dot" />
                <div className="activity-text">
                  <div className="activity-row">
                    <span className="activity-title">{item.action}</span>
                    <span className="activity-time">{item.time}</span>
                  </div>
                  <div className="activity-detail">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card notice">
            <div className="section-label">System Notice</div>
            <p>
              Scheduled maintenance window: <strong>Oct 3, 11:00 PM - 1:00 AM.</strong>{' '}
              The database will be read-only during this period.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard