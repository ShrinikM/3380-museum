import { useState, useEffect } from 'react'
import{ Badge, Panel, Modal } from '../components/ui'

function Artists() {
  const today = new Date().toISOString().split('T')[0]
  const [artists, setArtists] = useState([
    {
      ArtistID: 1,
      FirstName: 'Vincent',
      LastName: 'van Gogh',
      BirthYear: '1853-03-30',
      DeathYear: '1890-07-29',
      Nationality: 'Dutch',
      CreatedBy: 1
    },
    {
      ArtistID: 2,
      FirstName: 'Pablo',
      LastName: 'Picasso',
      BirthYear: '1881-10-25',
      DeathYear: '1973-04-08',
      Nationality: 'Spanish',
      CreatedBy: 1
    }
  ])
  const [search, setSearch] = useState('')
  const [nationality, setNationality] = useState('all')
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    BirthYear: '',
    DeathYear: '',
    Nationality: '',
    CreatedBy: ''
  })

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/artists')
      const data = await res.json()
      setArtists(data)
    } catch (err) {
      console.error('Error fetching artists:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      BirthYear: '',
      DeathYear: '',
      Nationality: '',
      CreatedBy: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if(formData.BirthYear > today){
      alert('Birth Date cannot be in the future.')
      return
    }

    if(formData.DeathYear && formData.DeathYear > today){
      alert('Death Date cannot be in the future.')
      return
    }

    if(formData.DeathYear && formData.DeathYear < formData.BirthYear){
      alert('Death Date cannot be before Birth Date.')
      return
    }

    const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if(!textPattern.test(formData.FirstName.trim())){
      alert('First Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if(!textPattern.test(formData.LastName.trim())){
      alert('Last Name can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if(!textPattern.test(formData.Nationality.trim())){
      alert('Nationality can only contain letters, spaces, hyphens, or apostrophes.')
      return
    }

    if(formData.CreatedBy && Number(formData.CreatedBy) < 1){
      alert('Created By must be a positive Staff ID.')
      return
    }

    const newArtist = {
      ArtistID: Math.max(...artists.map((artist)=> artist.ArtistID), 0) + 1,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      BirthYear: formData.BirthYear,
      DeathYear: formData.DeathYear,
      Nationality: formData.Nationality,
      CreatedBy: formData.CreatedBy
    }

    setArtists([...artists, newArtist])

    setFormData({
      FirstName: '',
      LastName: '',
      BirthYear: '',
      DeathYear: '',
      Nationality: '',
      CreatedBy: ''
    })

    setOpen(false)
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this artist?')

    if(!confirmed){
      return
    }

    setArtists(artists.filter((artist)=> artist.ArtistID !== id))
  }

  const nationalities = [
  ...new Set(
    artists
      .map((artist)=> artist.Nationality)
      .filter(Boolean)
  )
]

const filtered = artists.filter((artist)=>{
  const name = `${artist.FirstName} ${artist.LastName}`.toLowerCase()

  const matchesSearch =
    name.includes(search.toLowerCase()) ||
    artist.Nationality?.toLowerCase().includes(search.toLowerCase())

  const matchesNationality =
    nationality === 'all' || artist.Nationality === nationality

  return matchesSearch && matchesNationality
})

const livingArtists = artists.filter((artist)=> !artist.DeathYear)

  return (
    <div className="page">
      <div className="page-header">
      <div>
        <h1 className="page-title">Artists</h1>
        <p className="page-subtitle">
          Manage museum artists and their information.
        </p>
      </div>

      <button className="btn primary" onClick={()=> setOpen(true)}>
        Add Artist
      </button>
    </div>

    <div className="grid-3 section-gap-sm">
      <Panel className="summary-card">
        <div className="summary-value">{artists.length}</div>
        <div className="summary-label">Total Artists</div>
      </Panel>

      <Panel className="summary-card">
        <div className="summary-value">{livingArtists.length}</div>
        <div className="summary-label">Living Artists</div>
      </Panel>

      <Panel className="summary-card">
        <div className="summary-value">{nationalities.length}</div>
        <div className="summary-label">Nationalities</div>
      </Panel>
    </div>

    <div className="toolbar">
      <input
        value={search}
        onChange={(e)=> setSearch(e.target.value)}
        placeholder="Search artists..."
      />

      <select
        value={nationality}
        onChange={(e)=> setNationality(e.target.value)}
      >
        <option value="all">All Nationalities</option>

        {nationalities.map((item)=>(
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>

    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Artist</th>
            <th>Birth Date</th>
            <th>Death Date</th>
            <th>Nationality</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item)=>(
            <tr key={item.ArtistID}>
              <td>
                <div className="strong">
                  {item.FirstName} {item.LastName}
                </div>
                <div className="cell-sub mono">
                  #{String(item.ArtistID).padStart(5, '0')}
                </div>
              </td>

              <td className="mono">
                {item.BirthYear
                  ? item.BirthYear.split('T')[0]
                  : '-'}
              </td>

              <td className="mono">
                {item.DeathYear
                  ? item.DeathYear.split('T')[0]
                  : 'Living'}
              </td>

              <td>
                <Badge
                  variant="active"
                  label={item.Nationality || 'Unknown'}
                />
              </td>

              <td className="mono">
                {item.CreatedBy || '-'}
              </td>

              <td>
                <button
                  className="btn danger"
                  onClick={()=> handleDelete(item.ArtistID)}
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
      title="Add Artist"
      onClose={()=> setOpen(false)}
    >
      <form onSubmit={handleSubmit} className="form-grid">

        <div className="form-group">
          <label>First Name</label>
          <input
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Birth Date</label>
          <input
            name="BirthYear"
            type="date"
            max={today}
            value={formData.BirthYear}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Death Date</label>
          <input
            name="DeathYear"
            type="date"
            min={formData.BirthYear}
            max={today}
            value={formData.DeathYear}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Nationality</label>
          <input
            name="Nationality"
            value={formData.Nationality}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Created By</label>
          <input
            name="CreatedBy"
            type="number"
            min="1"
            value={formData.CreatedBy}
            onChange={handleChange}
            placeholder="Staff ID"
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

          <button type="submit" className="btn primary">
            Add Artist
          </button>
        </div>

      </form>
    </Modal>
  </div>
  )
}

export default Artists