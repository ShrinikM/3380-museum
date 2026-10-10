import{ useState } from 'react'
import{ Badge, Panel, Modal } from '../components/ui'

function Exhibitions(){
  const today = new Date().toISOString().split('T')[0]

  const [exhibitions, setExhibitions] = useState([
    {
      ExhibitionID: 1,
      Name: 'Modern Art',
      Description: 'Modern and contemporary artwork exhibition.',
      StartDate: '2026-09-01',
      EndDate: '2026-12-15',
      Capacity: 500,
      Tickets: 320,
      StaffNames: ['K. Martinez'],
      ArtworkCount: 24,
      Status: 'active',
    },
    {
      ExhibitionID: 2,
      Name: 'Ancient Americas',
      Description: 'Art and objects from ancient American cultures.',
      StartDate: '2026-10-10',
      EndDate: '2027-02-20',
      Capacity: 180,
      Tickets: 0,
      StaffNames: ['T. Okafor'],
      ArtworkCount: 18,
      Status: 'upcoming',
    },
  ])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    StartDate: '',
    EndDate: '',
    Capacity: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      Name: '',
      Description: '',
      StartDate: '',
      EndDate: '',
      Capacity: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const name = formData.Name.trim()
    const description = formData.Description.trim()
    const capacity = Number(formData.Capacity)

    const textPattern = /^[A-Za-z0-9À-ÖØ-öø-ÿ\s.,:;!?'"()&'-]+$/

    if(!textPattern.test(name)){
      alert('Exhibition Name contains invalid characters.')
      return
    }

    if(!textPattern.test(description)){
      alert('Description contains invalid characters.')
      return
    }

    if(name.length < 1){
      alert('Exhibition name is required.')
      return
    }

    if(!formData.StartDate || !formData.EndDate){
      alert('Start Date and End Date are required.')
      return
    }

    if(formData.EndDate < formData.StartDate){
      alert('End Date cannot be before Start Date.')
      return
    }

    if(capacity < 1 || capacity > 1400){
      alert('Capacity must be between 1 and 1400.')
      return
    }

    const duplicate = exhibitions.some(
      (exhibition)=> exhibition.Name.toLowerCase() === name.toLowerCase()
    )

    if(duplicate){
      alert('An exhibition with this name already exists.')
      return
    }

    let newStatus = 'upcoming'

    if(formData.StartDate <= today && formData.EndDate >= today){
      newStatus = 'active'
    }

    if(formData.EndDate < today){
      newStatus = 'completed'
    }

    const newExhibition = {
      ExhibitionID: Math.max(
        ...exhibitions.map((exhibition)=> exhibition.ExhibitionID),
        0
      ) + 1,
      Name: name,
      Description: description,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      Capacity: capacity,
      Tickets: 0,
      StaffNames: [],
      ArtworkCount: 0,
      Status: newStatus
    }

    setExhibitions([...exhibitions, newExhibition])

    resetForm()
    setOpen(false)
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this exhibition?'
    )

    if(!confirmed){
      return
    }

    setExhibitions(
      exhibitions.filter((exhibition)=> exhibition.ExhibitionID !== id)
    )
  }

  const filtered = exhibitions.filter((exhibition)=>{
    const matchesSearch =
      exhibition.Name.toLowerCase().includes(search.toLowerCase()) ||
      exhibition.Description.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      status === 'all' || exhibition.Status === status

    return matchesSearch && matchesStatus
  })

  return(
    <div className="page">

      <div className="page-header">
        <div>
          <h1 className="page-title">Exhibitions</h1>
          <p className="page-subtitle">
            Exhibition schedule, capacity, staff, and displayed artworks.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={()=>{
            resetForm()
            setOpen(true)
          }}
        >
          Add Exhibition
        </button>
      </div>

      <div className="grid-3 section-gap-sm">

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'active').length}
          </div>
          <div className="summary-label">Active Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'upcoming').length}
          </div>
          <div className="summary-label">Upcoming Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e)=> e.Status === 'completed').length}
          </div>
          <div className="summary-label">Completed Exhibitions</div>
        </Panel>

      </div>

      <div className="toolbar">

        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search exhibitions..."
        />

        <select
          value={status}
          onChange={(e)=> setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>

      </div>

      <div className="card table-wrap">

        <table className="data-table">

          <thead>
            <tr>
              <th>Exhibition</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Tickets / Capacity</th>
              <th>Staff</th>
              <th>Artworks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((exhibition)=>(
              <tr key={exhibition.ExhibitionID}>

                <td>
                  <div className="strong">{exhibition.Name}</div>
                  <div className="cell-sub">
                    {exhibition.Description || '-'}
                  </div>
                </td>

                <td className="mono">
                  {exhibition.StartDate}
                </td>

                <td className="mono">
                  {exhibition.EndDate}
                </td>

                <td>
                  {exhibition.Tickets} / {exhibition.Capacity}
                </td>

                <td>
                  {exhibition.StaffNames.length > 0
                    ? exhibition.StaffNames.join(', ')
                    : '-'}
                </td>

                <td>
                  {exhibition.ArtworkCount}
                </td>

                <td>
                  <Badge variant={exhibition.Status} />
                </td>

                <td>
                  <button
                    className="btn danger"
                    onClick={()=> handleDelete(exhibition.ExhibitionID)}
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
        title="Add Exhibition"
        onClose={()=>{
          resetForm()
          setOpen(false)
        }}
      >

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>Name</label>
            <input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              name="Capacity"
              type="number"
              min="1"
              max="1400"
              value={formData.Capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              name="StartDate"
              type="date"
              value={formData.StartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              name="EndDate"
              type="date"
              min={formData.StartDate}
              value={formData.EndDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              name="Description"
              value={formData.Description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="btn secondary"
              onClick={()=>{
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
            >
              Add Exhibition
            </button>

          </div>

        </form>

      </Modal>

    </div>
  )
}

export default Exhibitions