
import React, { useState } from 'react'

const INITIAL_STAFF = [
  { id: 'STF-101', name: 'Dr. Evelyn Reed', role: 'Chief Curator', department: 'Curatorial', email: 'e.reed@mfah.org', status: 'Active' },
  { id: 'STF-102', name: 'Marcus Vance', role: 'Head Registrar', department: 'Collections Management', email: 'm.vance@mfah.org', status: 'Active' },
  { id: 'STF-103', name: 'Sofia Rodriguez', role: 'Visitor Services Manager', department: 'Operations', email: 's.rodriguez@mfah.org', status: 'Active' },
  { id: 'STF-104', name: 'Liam Chen', role: 'Lead Restorer', department: 'Conservation', email: 'l.chen@mfah.org', status: 'On Leave' },
  { id: 'STF-105', name: 'Amara Okafor', role: 'Education Coordinator', department: 'Public Programs', email: 'a.okafor@mfah.org', status: 'Active' },
]

export default function Staff() {
  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Curatorial',
    email: '',
    status: 'Active',
  })

  const filteredStaff = staffMembers.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.role.trim() ||
      !formData.email.trim()
    ) {
      return
    }

    const newStaff = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      role: formData.role.trim(),
      department: formData.department,
      email: formData.email.trim(),
      status: formData.status,
    }

    setStaffMembers((current) => [newStaff, ...current])
    setFormData({
      name: '',
      role: '',
      department: 'Curatorial',
      email: '',
      status: 'Active',
    })
    setIsModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Directory</h1>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add Staff Member
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <label htmlFor="staff-search" className="sr-only">
          Search staff
        </label>
        <input
          id="staff-search"
          name="search"
          type="search"
          aria-label="Search staff by name, role, department, or email"
          placeholder="Search staff name, role, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid var(--border, #ccc)',
            width: '280px',
            fontSize: '14px',
          }}
        />

        <span style={{ fontSize: '14px', color: '#666' }} aria-live="polite">
          {filteredStaff.length} personnel listed
        </span>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
          }}
        >
          <caption className="sr-only">Museum staff directory</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border, #eee)', color: '#666' }}>
              <th scope="col" style={{ padding: '12px 16px' }}>STAFF ID</th>
              <th scope="col" style={{ padding: '12px 16px' }}>NAME</th>
              <th scope="col" style={{ padding: '12px 16px' }}>ROLE</th>
              <th scope="col" style={{ padding: '12px 16px' }}>DEPARTMENT</th>
              <th scope="col" style={{ padding: '12px 16px' }}>EMAIL</th>
              <th scope="col" style={{ padding: '12px 16px' }}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border, #f4f4f4)' }}>
                  <td style={{ padding: '12px 16px', color: '#888' }}>{item.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '12px 16px' }}>{item.role}</td>
                  <td style={{ padding: '12px 16px' }}>{item.department}</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{item.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: item.status === 'Active' ? '#e6f4ea' : '#fef3c7',
                        color: item.status === 'Active' ? '#137333' : '#b45309',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  No staff members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
            style={{ width: '420px', padding: '24px', background: '#fff' }}
          >
            <h2
              id="staff-modal-title"
              style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}
            >
              Add Staff Member
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="staff-name" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  id="staff-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={255}
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="staff-role" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Job Role / Title
                </label>
                <input
                  id="staff-role"
                  name="role"
                  type="text"
                  required
                  maxLength={255}
                  placeholder="e.g., Assistant Curator"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="staff-department" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Department
                </label>
                <select
                  id="staff-department"
                  name="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Curatorial">Curatorial</option>
                  <option value="Collections Management">Collections Management</option>
                  <option value="Conservation">Conservation</option>
                  <option value="Operations">Operations</option>
                  <option value="Public Programs">Public Programs</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="staff-email" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  placeholder="e.g., j.doe@mfah.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="staff-status" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  id="staff-status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
