import{ useState } from 'react'
import{ Badge, Panel, StatCard, Modal } from '../components/ui'

const membershipTypes = ['Individual', 'Family', 'Student', 'Senior']

const initialMemberships = [
  {
    id: 1,
    firstName: 'Patricia',
    lastName: 'Holloway',
    email: 'patricia@example.com',
    type: 'Senior',
    startDate: '2026-08-15',
    endDate: '2027-08-15',
    price: 60,
    discount: 15,
    payment: 'Credit Card',
    status: 'active',
  },
  {
    id: 2,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james@example.com',
    type: 'Individual',
    startDate: '2026-09-01',
    endDate: '2027-09-01',
    price: 75,
    discount: 5,
    payment: 'Credit Card',
    status: 'active',
  },
  {
    id: 3,
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@example.com',
    type: 'Student',
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    price: 40,
    discount: 10,
    payment: 'Cash',
    status: 'upcoming',
  },
]

const membershipPrices = {
  Individual: 75,
  Family: 150,
  Student: 40,
  Senior: 60,
}

const membershipDiscounts = {
  Individual: 5,
  Family: 10,
  Student: 10,
  Senior: 15,
}

function Memberships(){
  const [memberships, setMemberships] = useState(initialMemberships)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    type: '',
    startDate: '',
    endDate: '',
    price: '',
    discount: '',
    payment: ''
  })
  const maxEndDate = formData.startDate
    ? new Date(new Date(formData.startDate).setFullYear(new Date(formData.startDate).getFullYear() + 1)).toISOString().split('T')[0]
    : undefined

  const handleChange = (e) => {
    const { name, value } = e.target

    if(name === 'type'){
      setFormData({
        ...formData,
        type: value,
        price: value ? membershipPrices[value] : '',
        discount: value ? membershipDiscounts[value] : ''
      })
      return
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const firstName = formData.firstName.trim()
    const lastName = formData.lastName.trim()
    const email = formData.email.trim()
    const price = Number(formData.price)
    const discount = Number(formData.discount)

    const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if(!textPattern.test(firstName)){
      alert('First Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if(!textPattern.test(lastName)){
      alert('Last Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if(price <= 0){
      alert('Price must be greater than 0.')
      return
    }

    if(discount < 0 || discount > 100){
      alert('Discount must be between 0 and 100.')
      return
    }

    if(formData.endDate < formData.startDate){
      alert('End Date cannot be before Start Date.')
      return
    }

    const maxEndDate = new Date(formData.startDate)
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1)

    if(new Date(formData.endDate) > maxEndDate){
      alert('Membership cannot be longer than 1 year.')
      return
    }

    const newMembership = {
      id: Math.max(...memberships.map((member)=> member.id), 0) + 1,
      firstName,
      lastName,
      email,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      price,
      discount,
      payment: formData.payment,
      status: formData.startDate > new Date().toISOString().split('T')[0]
        ? 'upcoming'
        : 'active'
    }

    setMemberships([...memberships, newMembership])

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      type: '',
      startDate: '',
      endDate: '',
      price: '',
      discount: '',
      payment: ''
    })

    setOpen(false)
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this membership?')

    if(!confirmed){
      return
    }

    setMemberships(memberships.filter((member)=> member.id !== id))
  }

  const active = memberships.filter((member)=> member.status === 'active')
  const upcoming = memberships.filter((member)=> member.status === 'upcoming')
  const expired = memberships.filter((member)=> member.status === 'expired')

  const revenue = memberships.reduce((sum, member)=> sum + member.price, 0)

  const filtered = memberships.filter((member)=>{
    const name = `${member.firstName} ${member.lastName}`.toLowerCase()

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())

    const matchesType = type === 'all' || member.type === type
    const matchesStatus = status === 'all' || member.status === status

    return matchesSearch && matchesType && matchesStatus
  })

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Memberships</h1>
          <p className="page-subtitle">
            Member accounts, membership periods, and discounts.
          </p>
        </div>

        <button className="btn primary" onClick={()=> setOpen(true)}>
          Add Membership
        </button>
      </div>

      <div className="grid-4 section-gap-sm">
        <StatCard label="Active Members" value={active.length} />
        <StatCard label="Upcoming" value={upcoming.length} />
        <StatCard label="Expired" value={expired.length} />
        <StatCard label="Membership Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>

      <div className="grid-4 section-gap-sm tight">
        {membershipTypes.map((membershipType)=>(
          <Panel key={membershipType} className="price-card">
            <div className="price-top">
              <div>
                <div className="stat-label">{membershipType}</div>
                <div className="price-value">
                  ${membershipPrices[membershipType]}<span>/yr</span>
                </div>
              </div>

              <Badge
                variant={membershipType.toLowerCase()}
                label={membershipType}
              />
            </div>

            <div className="price-count">
              {active.filter((member)=> member.type === membershipType).length} active
            </div>
          </Panel>
        ))}
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search members or email..."
        />

        <select value={type} onChange={(e)=> setType(e.target.value)}>
          <option value="all">All Types</option>
          {membershipTypes.map((membershipType)=>(
            <option key={membershipType} value={membershipType}>
              {membershipType}
            </option>
          ))}
        </select>

        <select value={status} onChange={(e)=> setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((member)=>(
              <tr key={member.id}>
                <td>
                  <div className="strong">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="cell-sub mono">{member.email}</div>
                </td>

                <td>
                  <Badge
                    variant={member.type.toLowerCase()}
                    label={member.type}
                  />
                </td>

                <td className="mono">{member.startDate}</td>
                <td className="mono">{member.endDate}</td>
                <td className="mono">${member.price.toFixed(2)}</td>
                <td className="mono">{member.discount}%</td>
                <td className="muted nowrap">{member.payment}</td>
                <td><Badge variant={member.status} /></td>
                <td>
                  <button
                    className="btn danger"
                    onClick={()=> handleDelete(member.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title="Add Membership"
        onClose={()=> setOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {membershipTypes.map((membershipType)=>(
                <option key={membershipType} value={membershipType}>
                  {membershipType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              max={maxEndDate}
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              name="price"
              type="number"
              min="0.01"
              max="999999.99"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Discount %</label>
            <input
              name="discount"
              type="number"
              value={formData.discount}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Payment</label>
            <select
              name="payment"
              value={formData.payment}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={()=>{
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  type: '',
                  startDate: '',
                  endDate: '',
                  price: '',
                  discount: '',
                  payment: ''
                })
                setOpen(false)
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              Add Membership
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Memberships