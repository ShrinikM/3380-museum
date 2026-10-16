import { useState } from 'react'
import { Panel, Modal } from '../components/ui'
import { useRole } from '../context/role'

const INITIAL_STAFF = [
  { id: 'STF-101', name: 'Dr. Evelyn Reed', role: 'Chief Curator', department: 'Curatorial', email: 'e.reed@mfah.org', status: 'Active' },
  { id: 'STF-102', name: 'Marcus Vance', role: 'Head Registrar', department: 'Collections Management', email: 'm.vance@mfah.org', status: 'Active' },
  { id: 'STF-103', name: 'Sofia Rodriguez', role: 'Visitor Services Manager', department: 'Operations', email: 's.rodriguez@mfah.org', status: 'Active' },
  { id: 'STF-104', name: 'Liam Chen', role: 'Lead Restorer', department: 'Conservation', email: 'l.chen@mfah.org', status: 'On Leave' },
  { id: 'STF-105', name: 'Amara Okafor', role: 'Education Coordinator', department: 'Public Programs', email: 'a.okafor@mfah.org', status: 'Active' },
]

const emptyForm = {
  name: '',
  role: '',
  department: 'Curatorial',
  email: '',
  status: 'Active',
}

const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

function Staff() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/staff')

  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const activeCount = staffMembers.filter(
    (item) => item.status === 'Active'
  ).length

  const departmentCount = new Set(
    staffMembers.map((item) => item.department)
  ).size

  const filteredStaff = staffMembers.filter((item) => {
    const text =
      `${item.id} ${item.name} ${item.role} ${item.department} ${item.email} ${item.status}`.toLowerCase()

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
    setEditingId(item.id)
    setFormData({
      name: item.name || '',
      role: item.role || '',
      department: item.department || 'Curatorial',
      email: item.email || '',
      status: item.status || 'Active',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    resetForm()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaffMembers((currentStaff) =>
        currentStaff.filter((item) => item.id !== id)
      )
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const role = formData.role.trim()
    const email = formData.email.trim()

    if (!name || !role || !formData.department || !email || !formData.status) {
      alert('Please complete all required fields.')
      return
    }

    if (!textPattern.test(name)) {
      alert(
        'Full Name can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!textPattern.test(role)) {
      alert(
        'Job Role can only contain letters, spaces, hyphens, or apostrophes.'
      )
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.')
      return
    }

    const validDepartments = [
      'Curatorial',
      'Collections Management',
      'Conservation',
      'Operations',
      'Public Programs',
      'Administration',
    ]

    if (!validDepartments.includes(formData.department)) {
      alert('Please select a valid department.')
      return
    }

    if (!['Active', 'On Leave'].includes(formData.status)) {
      alert('Please select a valid staff status.')
      return
    }

    const emailExists = staffMembers.some(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.id !== editingId
    )

    if (emailExists) {
      alert('This email address is already assigned to another staff member.')
      return
    }

    const staffData = {
      name,
      role,
      department: formData.department,
      email,
      status: formData.status,
    }

    if (editingId !== null) {
      setStaffMembers((currentStaff) =>
        currentStaff.map((item) =>
          item.id === editingId ? { ...item, ...staffData } : item
        )
      )
    } else {
      const nextNumber =
        Math.max(
          100,
          ...staffMembers.map((item) =>
            Number(item.id.replace('STF-', ''))
          )
        ) + 1

      setStaffMembers((currentStaff) => [
        { id: `STF-${nextNumber}`, ...staffData },
        ...currentStaff,
      ])
    }

    closeModal()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Directory</h1>
        </div>

        {allowEdit && (
          <button
            type="button"
            className="btn primary"
            onClick={handleOpenAdd}
          >
            Add Staff Member
          </button>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search staff..."
        />
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <caption className="sr-only">Museum staff directory</caption>
          <thead>
            <tr>
              <th scope="col">Staff ID</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Department</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              {allowEdit && <th scope="col">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredStaff.map((item) => (
              <tr key={item.id}>
                <td className="mono">{item.id}</td>
                <td className="strong">{item.name}</td>
                <td>{item.role}</td>
                <td>{item.department}</td>
                <td className="muted">{item.email}</td>
                <td>{item.status}</td>

                {allowEdit && (
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => handleOpenEdit(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 7 : 6} className="empty">
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
            <label htmlFor="staff-name">Full Name</label>
            <input
              id="staff-name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-role">Job Role / Title</label>
            <input
              id="staff-role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]+"
              title="Use letters, spaces, hyphens, or apostrophes only."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-department">Department</label>
            <select
              id="staff-department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="Curatorial">Curatorial</option>
              <option value="Collections Management">Collections Management</option>
              <option value="Conservation">Conservation</option>
              <option value="Operations">Operations</option>
              <option value="Public Programs">Public Programs</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="staff-email">Email Address</label>
            <input
              id="staff-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-status">Status</label>
            <select
              id="staff-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
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