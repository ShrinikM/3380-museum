import React, { useState, useEffect } from 'react'

function Artworks() {
  const [artworks, setArtworks] = useState([])
  const [artists, setArtists] = useState([])
  const [collections, setCollections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMedium, setFilterMedium] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    Title: '',
    ArtistID: '',
    CreationYear: '',
    Medium: '',
    Dimensions: '',
    CollectionID: '',
    Department: '',
    CreatedBy: ''
  })

  useEffect(() => {
    fetchArtworks()
    fetchDropdowns()
  }, [])

  const fetchArtworks = async () => {
    try {
      const res = await fetch('/api/artworks')
      const data = await res.json()
      if (Array.isArray(data)) setArtworks(data)
    } catch (err) {
      console.error('Error fetching artworks:', err)
    }
  }

  const fetchDropdowns = async () => {
    try {
      const [artistsRes, collectionsRes] = await Promise.all([
        fetch('/api/artists'),
        fetch('/api/collections')
      ])
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json()
        if (Array.isArray(artistsData)) setArtists(artistsData)
      }
      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json()
        if (Array.isArray(collectionsData)) setCollections(collectionsData)
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchArtworks()
        setFormData({
          Title: '',
          ArtistID: '',
          CreationYear: '',
          Medium: '',
          Dimensions: '',
          CollectionID: '',
          Department: '',
          CreatedBy: ''
        })
        setIsModalOpen(false)
      } else {
        const errData = await res.json()
        setError(errData.message || 'Failed to save artwork record.')
      }
    } catch (err) {
      console.error('Error adding artwork:', err)
      setError('Server error while saving artwork.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchArtworks()
      }
    } catch (err) {
      console.error('Error deleting artwork:', err)
    }
  }

  // Filter artworks by title or artist name search
  const filteredArtworks = artworks.filter((item) => {
    const titleMatch = (item.Title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const artistMatch = item.ArtistName ? item.ArtistName.toLowerCase().includes(searchTerm.toLowerCase()) : false
    const mediumMatch = filterMedium ? item.Medium === filterMedium : true
    return (titleMatch || artistMatch) && mediumMatch
  })

  // Get list of unique mediums for filter dropdown
  const uniqueMediums = [...new Set(artworks.map((a) => a.Medium).filter(Boolean))]

  return (
    <div className="page">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Artworks</h1>
          <p className="page-subtitle">
            Catalog entries including artist details, medium, creation year, and assigned collection.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Artwork
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Toolbar & Search */}
        <div className="toolbar" style={{ padding: '16px 20px 0 20px' }}>
          <div className="search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-select">
            <select value={filterMedium} onChange={(e) => setFilterMedium(e.target.value)}>
              <option value="">All Mediums</option>
              {uniqueMediums.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <div className="record-count">{filteredArtworks.length} records found</div>
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title & Medium</th>
                <th>Artist</th>
                <th>Year</th>
                <th>Dimensions</th>
                <th>Collection</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtworks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty">
                    No artworks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredArtworks.map((item) => (
                  <tr key={item.ArtworkID}>
                    <td className="mono">{item.ArtworkID}</td>
                    <td>
                      <div className="strong">{item.Title}</div>
                      <div className="cell-sub">{item.Medium || 'Medium Unspecified'}</div>
                    </td>
                    <td>
                      {item.ArtistName || (item.ArtistID ? `Artist #${item.ArtistID}` : 'Unknown Artist')}
                    </td>
                    <td className="mono">{item.CreationYear || '—'}</td>
                    <td className="muted small">{item.Dimensions || '—'}</td>
                    <td>
                      {item.CollectionName ? (
                        <span className="chip chip-primary">{item.CollectionName}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {item.Department ? (
                        <span className="badge badge-active">{item.Department}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-action delete"
                          title="Delete Artwork"
                          onClick={() => handleDelete(item.ArtworkID)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Adding Artwork */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Artwork Entry</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

                <div className="form-grid">
                  <div className="field span-2">
                    <label className="field-label">Artwork Title</label>
                    <input
                      className="input"
                      name="Title"
                      placeholder="e.g. Starry Night"
                      value={formData.Title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Artist</label>
                    <select className="input" name="ArtistID" value={formData.ArtistID} onChange={handleChange} required>
                      <option value="">Select Artist...</option>
                      {artists.map((a) => (
                        <option key={a.ArtistID} value={a.ArtistID}>
                          {a.FirstName} {a.LastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Creation Year</label>
                    <input
                      className="input mono"
                      type="number"
                      name="CreationYear"
                      placeholder="e.g. 1889"
                      value={formData.CreationYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Medium</label>
                    <input
                      className="input"
                      name="Medium"
                      placeholder="e.g. Oil on canvas"
                      value={formData.Medium}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Dimensions</label>
                    <input
                      className="input"
                      name="Dimensions"
                      placeholder="e.g. 73.7 cm × 92.1 cm"
                      value={formData.Dimensions}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Collection</label>
                    <select className="input" name="CollectionID" value={formData.CollectionID} onChange={handleChange}>
                      <option value="">None / Unassigned</option>
                      {collections.map((c) => (
                        <option key={c.CollectionID} value={c.CollectionID}>
                          {c.Name || c.CollectionName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Department</label>
                    <input
                      className="input"
                      name="Department"
                      placeholder="e.g. European Painting"
                      value={formData.Department}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field span-2">
                    <label className="field-label">Created By (Staff ID) <span className="optional">(Optional)</span></label>
                    <input
                      className="input mono"
                      name="CreatedBy"
                      placeholder="Staff ID number"
                      value={formData.CreatedBy}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }}>
                <div className="modal-actions" style={{ width: '100%' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Artwork
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Artworks