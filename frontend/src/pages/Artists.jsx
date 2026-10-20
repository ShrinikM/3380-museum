import { useState, useEffect } from 'react'
import { Badge, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

function Artists() {
  const { user, canEdit } = useRole()
  const allowEdit = canEdit('/artists')
  const showAudit = user.role === 'Admin' || user.role === 'Supervisor'
  const today = new Date().toISOString().split('T')[0]

  const [artists, setArtists] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    BirthYear: '',
    DeathYear: '',
    Nationality: '',
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
    setReloadCount((count) => count + 1)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      BirthYear: '',
      DeathYear: '',
      Nationality: '',
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (artist) => {
    setFormData({
      FirstName: artist.FirstName || '',
      LastName: artist.LastName || '',
      BirthYear: artist.BirthYear
        ? artist.BirthYear.split('T')[0]
        : '',
      DeathYear: artist.DeathYear
        ? artist.DeathYear.split('T')[0]
        : '',
      Nationality: artist.Nationality || '',
    })

    setEditingId(artist.ArtistID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.BirthYear > today) {
      alert('Birth Date cannot be in the future.')
      return
    }

    if (formData.DeathYear && formData.DeathYear > today) {
      alert('Death Date cannot be in the future.')
      return
    }

    if (
      formData.DeathYear &&
      formData.DeathYear < formData.BirthYear
    ) {
      alert('Death Date cannot be before Birth Date.')
      return
    }

    const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if (!textPattern.test(formData.FirstName.trim())) {
      alert(
        'First Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(formData.LastName.trim())) {
      alert(
        'Last Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(formData.Nationality.trim())) {
      alert(
        'Nationality can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    const artistData = {
      FirstName: formData.FirstName.trim(),
      LastName: formData.LastName.trim(),
      BirthYear: formData.BirthYear,
      DeathYear: formData.DeathYear || null,
      Nationality: formData.Nationality.trim(),
    }

    try {
      if (editingId === null) {
        await callApi('/api/artists', 'POST', artistData)
      } else {
        await callApi(
          '/api/artists/' + editingId,
          'PUT',
          artistData
        )
      }
    } catch (err) {
      alert(err.message)
      return
    }

    resetForm()
    setEditingId(null)
    setOpen(false)
    clear()
    refetchArtists()
  }

  const filtered = artists.filter((artist) => {
    const name =
      `${artist.FirstName} ${artist.LastName}`.toLowerCase()
    const searchText = search.toLowerCase()

    return (
      name.includes(searchText) ||
      (artist.Nationality || '').toLowerCase().includes(searchText)
    )
  })

  const {
    selectedRows: selectedArtists,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filtered, (artist) => artist.ArtistID)

  const handleEditSelected = () => {
    openEditModal(selectedArtists[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'artist',
      (artist) => `${artist.FirstName} ${artist.LastName}`,
      (artist) => callApi('/api/artists/' + artist.ArtistID, 'DELETE')
    )

    if (deleted) refetchArtists()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Artists</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedArtists.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Artist
            </button>
          </div>
        )}
      </div>

      <div className="toolbar">
        <label htmlFor="artist-search" className="sr-only">
          Search artists
        </label>
        <input
          id="artist-search"
          type="search"
          className="search-input"
          name="artistSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists..."
        />
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table
          className={
            'data-table' + (selectedArtists.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum artists</caption>

          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Artist</th>
              <th scope="col">Birth Date</th>
              <th scope="col">Death Date</th>
              <th scope="col">Nationality</th>
              <th scope="col">Artworks</th>
              {showAudit && <th scope="col">Created By</th>}
              {showAudit && <th scope="col">Last Updated By</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.ArtistID}
                className={isSelected(item.ArtistID) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(item.ArtistID)}
                      onChange={() => toggle(item.ArtistID)}
                      aria-label={`Select ${item.FirstName} ${item.LastName}`}
                    />
                  </td>
                )}

                <td className="strong">
                  {item.FirstName} {item.LastName}
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

                <td className="mono">{item.ArtworkCount}</td>
                {showAudit && <td>{item.CreatedByName || '-'}</td>}
                {showAudit && <td>{item.UpdatedByName || '-'}</td>}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5 + (showAudit ? 2 : 0) + (allowEdit ? 1 : 0)}
                  className="empty"
                >
                  No artists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Artist' : 'Edit Artist'}
        onClose={() => {
          resetForm()
          setEditingId(null)
          setOpen(false)
        }}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="artist-first-name">First Name</label>
            <input
              id="artist-first-name"
              name="FirstName"
              autoComplete="given-name"
              value={formData.FirstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-last-name">Last Name</label>
            <input
              id="artist-last-name"
              name="LastName"
              autoComplete="family-name"
              value={formData.LastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-birth-date">Birth Date</label>
            <input
              id="artist-birth-date"
              name="BirthYear"
              type="date"
              max={today}
              value={formData.BirthYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-death-date">Death Date</label>
            <input
              id="artist-death-date"
              name="DeathYear"
              type="date"
              min={formData.BirthYear || undefined}
              max={today}
              value={formData.DeathYear}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-nationality-input">Nationality</label>
            <input
              id="artist-nationality-input"
              name="Nationality"
              autoComplete="country-name"
              value={formData.Nationality}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                resetForm()
                setEditingId(null)
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