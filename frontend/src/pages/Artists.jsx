import { useState, useEffect } from 'react'
import{ Badge, Panel, Modal } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'

function Artists() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/artists')
  const today = new Date().toISOString().split('T')[0]
  const [artists, setArtists] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [nationality, setNationality] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    BirthYear: '',
    DeathYear: '',
    Nationality: '',
    CreatedBy: ''
  })

  useEffect(() => {
    async function loadArtists() {
      try {
        const data = await callApi('/api/artists', 'GET')
        setArtists(data)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load artists: ' + err.message)
      }
    }

    loadArtists()
  }, [reloadCount])

  const refetchArtists = () => {
    setReloadCount(reloadCount + 1)
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

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (artist) => {
    setFormData({
      FirstName: artist.FirstName,
      LastName: artist.LastName,
      BirthYear: artist.BirthYear,
      DeathYear: artist.DeathYear || '',
      Nationality: artist.Nationality,
      CreatedBy: ''
    })
    setEditingId(artist.ArtistID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
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

    const artistData = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      BirthYear: formData.BirthYear,
      DeathYear: formData.DeathYear || null,
      Nationality: formData.Nationality
    }

    try {
      if(editingId === null){
        artistData.CreatedBy = formData.CreatedBy ? Number(formData.CreatedBy) : null
        await callApi('/api/artists', 'POST', artistData)
      } else {
        await callApi('/api/artists/' + editingId, 'PUT', artistData)
      }
    } catch (err) {
      alert(err.message)
      return
    }

    resetForm()
    setOpen(false)
    refetchArtists()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this artist?')

    if(!confirmed){
      return
    }

    try {
      await callApi('/api/artists/' + id, 'DELETE')
    } catch (err) {
      alert(err.message)
      return
    }

    refetchArtists()
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

      {allowEdit && (
        <button className="btn primary" onClick={openAddModal}>
          Add Artist
        </button>
      )}
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

    {loadError && <p className="empty">{loadError}</p>}

    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Artist</th>
            <th>Birth Date</th>
            <th>Death Date</th>
            <th>Nationality</th>
            <th>Artworks</th>
            <th>Created By</th>
            {allowEdit && <th>Actions</th>}
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
                {item.ArtworkCount}
              </td>

              <td className="mono">
                {item.CreatedBy || '-'}
              </td>

              {allowEdit && (
                <td>
                  <div className="row-actions">
                    <button
                      className="btn secondary"
                      onClick={()=> openEditModal(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn danger"
                      onClick={()=> handleDelete(item.ArtistID)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Modal
      open={open}
      title={editingId === null ? 'Add Artist' : 'Edit Artist'}
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

        {editingId === null && (
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
        )}

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
            {editingId === null ? 'Add Artist' : 'Save Changes'}
          </button>
        </div>

      </form>
    </Modal>
  </div>
  )
}

export default Artists