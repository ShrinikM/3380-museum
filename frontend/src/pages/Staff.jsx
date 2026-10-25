import { useState, useEffect } from 'react'
import { Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

const ROLE_OPTIONS = ['Admin', 'Staff']

const DEPARTMENT_OPTIONS = [
  'Administration',
  'Collections',
  'Collections Management',
  'Conservation',
  'Curatorial',
  'Operations',
  'Public Programs',
  'Visitor Services',
]

const emptyForm = {
  FirstName: '',
  LastName: '',
  Role: 'Staff',
  Department: 'Curatorial',
  Email: '',
  PhoneNumber: '',
  StartDate: '',
  EndDate: '',
}

const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

function Staff() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/staff')
  const today = new Date().toISOString().split('T')[0]

  const [staffMembers, setStaffMembers] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await callApi('/api/staff', 'GET')
        setStaffMembers(data)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load staff: ' + err.message)
      }
    }

    loadStaff()
  }, [reloadCount])

  const refetchStaff = () => {
    setReloadCount((count) => count + 1)
  }

  const getStatus = (item) => {
    if (item.EndDate && item.EndDate <= today) {
      return 'Ended'
    }
    return 'Active'
  }

  const activeCount = staffMembers.filter(
    (item) => getStatus(item) === 'Active'
  ).length

  const departmentCount = new Set(
    staffMembers.map((item) => item.Department)
  ).size

  const filteredStaff = staffMembers.filter((item) => {
    const text =
      `${item.StaffID} ${item.FirstName} ${item.LastName} ${item.Role} ${item.Department} ${item.Email} ${item.PhoneNumber} ${getStatus(item)}`.toLowerCase()

    return text.includes(searchTerm.toLowerCase())
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({ ...emptyForm })
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingId(item.StaffID)
    setFormData({
      FirstName: item.FirstName || '',
      LastName: item.LastName || '',
      Role: item.Role || 'Staff',
      Department: item.Department || 'Curatorial',
      Email: item.Email || '',
      PhoneNumber: item.PhoneNumber || '',
      StartDate: item.StartDate || '',
      EndDate: item.EndDate || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const firstName = formData.FirstName.trim()
    const lastName = formData.LastName.trim()
    const email = formData.Email.trim()
    const phone = formData.PhoneNumber.trim()

    if (!textPattern.test(firstName)) {
      alert(
        'First Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(lastName)) {
      alert(
        'Last Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.')
      return
    }

    if (!/^[0-9+()\- ]{7,20}$/.test(phone)) {
      alert('Please enter a valid phone number.')
      return
    }

    if (formData.EndDate && formData.EndDate < formData.StartDate) {
      alert('End Date cannot be before Start Date.')
      return
    }

    const staffData = {
      FirstName: firstName,
      LastName: lastName,
      Role: formData.Role,
      Department: formData.Department,
      Email: email,
      PhoneNumber: phone,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate || null,
    }

    try {
      if (editingId === null) {
        await callApi('/api/staff', 'POST', staffData)
      } else {
        await callApi('/api/staff/' + editingId, 'PUT', staffData)
      }
    } catch (err) {
      alert(err.message)
      return
    }

    closeModal()
    clear()
    refetchStaff()
  }

  const {
    selectedRows: selectedStaff,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filteredStaff, (item) => item.StaffID)

  const handleEditSelected = () => {
    handleOpenEdit(selectedStaff[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'staff member',
      (item) => `${item.FirstName} ${item.LastName}`,
      (item) => callApi('/api/staff/' + item.StaffID, 'DELETE')
    )

    if (deleted) refetchStaff()
  }

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedStaff.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={handleOpenAdd}
            >
              Add Staff Member
            </button>
          </div>
        )}
      </div>

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">{staffMembers.length}</div>
          <div className="summary-label">Total Staff</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{activeCount}</div>
          <div className="summary-label">Active Staff</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{departmentCount}</div>
          <div className="summary-label">Departments</div>
        </Panel>
      </div>

      <div className="toolbar">
        <label htmlFor="staff-search" className="sr-only">
          Search staff
        </label>
        <input
          id="staff-search"
          name="staffSearch"
          type="search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search staff..."
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
            'data-table' + (selectedStaff.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum staff directory</caption>
          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Staff ID</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Department</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Start Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredStaff.map((item) => (
              <tr
                key={item.StaffID}
                className={isSelected(item.StaffID) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(item.StaffID)}
                      onChange={() => toggle(item.StaffID)}
                      aria-label={`Select ${item.FirstName} ${item.LastName}`}
                    />
                  </td>
                )}

                <td className="mono">
                  #{String(item.StaffID).padStart(5, '0')}
                </td>
                <td className="strong">
                  {item.FirstName} {item.LastName}
                </td>
                <td>{item.Role}</td>
                <td>{item.Department}</td>
                <td className="muted">{item.Email}</td>
                <td className="mono">{item.PhoneNumber}</td>
                <td className="mono">{item.StartDate || '-'}</td>
                <td>{getStatus(item)}</td>
              </tr>
            ))}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 9 : 8} className="empty">
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={isModalOpen}
        title={editingId === null ? 'Add Staff Member' : 'Edit Staff Member'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="staff-first-name">First Name</label>
            <input
              id="staff-first-name"
              name="FirstName"
              type="text"
              autoComplete="given-name"
              value={formData.FirstName}
              onChange={handleChange}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-last-name">Last Name</label>
            <input
              id="staff-last-name"
              name="LastName"
              type="text"
              autoComplete="family-name"
              value={formData.LastName}
              onChange={handleChange}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-role">Role</label>
            <select
              id="staff-role"
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              required
            >
              {ROLE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="staff-department">Department</label>
            <select
              id="staff-department"
              name="Department"
              value={formData.Department}
              onChange={handleChange}
              required
            >
              {DEPARTMENT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="staff-email">Email Address</label>
            <input
              id="staff-email"
              name="Email"
              type="email"
              autoComplete="email"
              value={formData.Email}
              onChange={handleChange}
              maxLength={254}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-phone">Phone Number</label>
            <input
              id="staff-phone"
              name="PhoneNumber"
              type="tel"
              autoComplete="tel"
              value={formData.PhoneNumber}
              onChange={handleChange}
              pattern="[0-9+()\- ]{7,20}"
              title="Use 7 to 20 digits, spaces, dashes, plus signs, or parentheses."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-start-date">Start Date</label>
            <input
              id="staff-start-date"
              name="StartDate"
              type="date"
              value={formData.StartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-end-date">End Date</label>
            <input
              id="staff-end-date"
              name="EndDate"
              type="date"
              min={formData.StartDate || undefined}
              value={formData.EndDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {editingId === null ? 'Add Staff Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Staff
