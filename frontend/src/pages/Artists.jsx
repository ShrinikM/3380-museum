import { useState, useEffect } from 'react'
import { Badge, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'
import { TablePager, usePagedList } from '../components/TablePager'

function Artists() {
  const { user, canEdit } = useRole()
  const allowEdit = canEdit('/artists')
  const showAudit = user.role === 'Admin'
  const currentYear = new Date().getFullYear()

  const [artists, setArtists] = useState([])
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [artistToDelete, setArtistToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
    setFormError('')
  }

  const resetForm = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      BirthYear: '',
      DeathYear: '',
      Nationality: '',
    })
    setFormError('')
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setFormError('')
    setOpen(true)
  }

  const openEditModal = (artist) => {
    setFormData({
      FirstName: artist.FirstName || '',
      LastName: artist.LastName || '',
      BirthYear: artist.BirthYear != null
        ? String(artist.BirthYear)
        : '',
      DeathYear: artist.DeathYear != null
        ? String(artist.DeathYear)
        : '',
      Nationality: artist.Nationality || '',
    })

    setEditingId(artist.ArtistID)
    setFormError('')
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (
      !Number.isInteger(Number(formData.BirthYear)) ||
      Number(formData.BirthYear) < 1 ||
      Number(formData.BirthYear) > currentYear
    ) {
      setFormError(`Birth Year must be between 1 and ${currentYear}.`)
      return
    }

    if (
      formData.DeathYear !== '' &&
      (
        !Number.isInteger(Number(formData.DeathYear)) ||
        Number(formData.DeathYear) < Number(formData.BirthYear) ||
        Number(formData.DeathYear) > currentYear
      )
    ) {
      setFormError('Death Year must be a valid year between Birth Year and the current year.')
      return
    }

    const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if (!textPattern.test(formData.FirstName.trim())) {
      setFormError(
        'First Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(formData.LastName.trim())) {
      setFormError(
        'Last Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(formData.Nationality.trim())) {
      setFormError(
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
      setFormError(err.message)
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

  const { visibleRows, page, total, setPage } = usePagedList(filtered, search)

  const {
    selectedRows: selectedArtists,
    isSelected,
    toggle,
    clear,
  } = useSelection(filtered, (artist) => artist.ArtistID)

  const handleEditSelected = () => {
    openEditModal(selectedArtists[0])
  }

  const handleDeleteSelected = () => {
    if (selectedArtists.length === 0) return
    setArtistToDelete(selectedArtists[0])
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!artistToDelete) return

    setDeleting(true)
    try {
      await callApi('/api/artists/' + artistToDelete.ArtistID, 'DELETE')
      setDeleteModalOpen(false)
      setArtistToDelete(null)
      clear()
      refetchArtists()
    } catch (err) {
      setDeleteError('Could not delete artist: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page page-wide">
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
              <th scope="col">Birth Year</th>
              <th scope="col">Death Year</th>
              <th scope="col">Nationality</th>
              <th scope="col">Artworks</th>
              {showAudit && <th scope="col">Created By</th>}
              {showAudit && <th scope="col">Last Updated By</th>}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((item) => (
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
                    ? String(item.BirthYear)
                    : '-'}
                </td>

                <td className="mono">
                  {item.DeathYear
                    ? String(item.DeathYear)
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
      <TablePager page={page} total={total} onChange={setPage} />

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
          {formError && (
            <p className="form-error form-full" role="alert">
              {formError}
            </p>
          )}

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
            <label htmlFor="artist-birth-date">Birth Year</label>
            <input
              id="artist-birth-date"
              name="BirthYear"
              type="number"
              min={1}
              max={currentYear}
              value={formData.BirthYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-death-date">Death Year</label>
            <input
              id="artist-death-date"
              name="DeathYear"
              type="number"
              min={formData.BirthYear || undefined}
              max={currentYear}
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

      <Modal
        open={deleteModalOpen}
        title="Delete Artist"
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="form-grid">
          {deleteError && (
            <p className="form-error form-full" role="alert">
              {deleteError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            Are you sure you want to delete <strong>{artistToDelete?.FirstName} {artistToDelete?.LastName}</strong>? This action cannot be undone.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Artist'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Artists