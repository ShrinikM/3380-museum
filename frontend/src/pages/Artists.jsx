import React, { useState, useEffect } from 'react'

function Artists() {
  const [artists, setArtists] = useState([])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchArtists()
        setFormData({ FirstName: '', LastName: '', BirthYear: '', DeathYear: '', Nationality: '', CreatedBy: '' })
      }
    } catch (err) {
      console.error('Error adding artist:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/artists/${id}`, { method: 'DELETE' })
      fetchArtists()
    } catch (err) {
      console.error('Error deleting artist:', err)
    }
  }

  return (
    <div className="page">
      <h1>Artists</h1>
      <p>Manage museum artists and their information.</p>

      <div className="page-section">
        <h2>Artist Management</h2>
        <p>View, add, update, and delete artists.</p>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name="FirstName" placeholder="First Name" value={formData.FirstName} onChange={handleChange} required />
          <input name="LastName" placeholder="Last Name" value={formData.LastName} onChange={handleChange} required />
          <input name="BirthYear" type="date" value={formData.BirthYear} onChange={handleChange} required />
          <input name="DeathYear" type="date" value={formData.DeathYear} onChange={handleChange} />
          <input name="Nationality" placeholder="Nationality" value={formData.Nationality} onChange={handleChange} required />
          <input name="CreatedBy" placeholder="Staff ID (CreatedBy)" value={formData.CreatedBy} onChange={handleChange} />
          <button type="submit">Add Artist</button>
        </form>

        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Death Date</th>
              <th>Nationality</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((item) => (
              <tr key={item.ArtistID}>
                <td>{item.ArtistID}</td>
                <td>{item.FirstName} {item.LastName}</td>
                <td>{item.BirthYear ? item.BirthYear.split('T')[0] : ''}</td>
                <td>{item.DeathYear ? item.DeathYear.split('T')[0] : 'N/A'}</td>
                <td>{item.Nationality}</td>
                <td>
                  <button onClick={() => handleDelete(item.ArtistID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Artists