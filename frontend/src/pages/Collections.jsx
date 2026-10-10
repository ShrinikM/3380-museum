import React, { useState, useEffect } from 'react'

function Collections() {
  const [collections, setCollections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    CreatedBy: ''
  })

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections')
      const data = await res.json()
      if (Array.isArray(data)) setCollections(data)
    } catch (err) {
      console.error('Error fetching collections:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchCollections()
        setFormData({ Name: '', Description: '', CreatedBy: '' })
        setIsModalOpen(false)
      } else {
        const errData = await res.json()
        setError(errData.message || 'Failed to create collection.')
      }
    } catch (err) {
      console.error('Error adding collection:', err)
      setError('Server error while saving collection.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return
    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCollections()
      }
    } catch (err) {
      console.error('Error deleting collection:', err)
    }
  }

  // Filter collections by search term
  const filteredCollections = collections.filter((c) => {
    const nameMatch = (c.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const descMatch = (c.Description || '').toLowerCase().includes(searchTerm.toLowerCase())
    return nameMatch || descMatch
  })

  return (
    <div className="page">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Collections</h1>
          <p className="page-subtitle">
            Manage permanent thematic groupings and curate gallery collections.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Collection
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
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="record-count">{filteredCollections.length} collections total</div>
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Collection Name</th>
                <th>Description</th>
                <th>Curator / Staff ID</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No collections found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item) => (
                  <tr key={item.CollectionID}>
                    <td className="mono">{item.CollectionID}</td>
                    <td>
                      <span className="chip chip-primary" style={{ fontSize: '13px', fontWeight: '500' }}>
                        {item.Name}
                      </span>
                    </td>
                    <td>
                      <div className="cell-sub" style={{ maxWidth: '450px' }}>
                        {item.Description}
                      </div>
                    </td>
                    <td className="mono muted">
                      {item.CreatedBy ? `Staff #${item.CreatedBy}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-action delete"
                          title="Delete Collection"
                          onClick={() => handleDelete(item.CollectionID)}
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

      {/* Modal Dialog for Adding Collection */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Collection Entry</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

                <div className="form" style={{ gap: '14px' }}>
                  <div className="field">
                    <label className="field-label">Collection Name</label>
                    <input
                      className="input"
                      name="Name"
                      placeholder="e.g. Modern Impressionism, Ancient Antiquities"
                      value={formData.Name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Description</label>
                    <textarea
                      className="input"
                      name="Description"
                      placeholder="Brief overview of the collection's theme or historical context..."
                      value={formData.Description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Created By (Staff ID) <span className="optional">(Optional)</span>
                    </label>
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
                    Save Collection
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

export default Collections