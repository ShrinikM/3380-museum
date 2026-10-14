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
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Curatorial',
    email: '',
    status: 'Active'
  })

  const filteredStaff = staffMembers.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', role: '', department: 'Curatorial', email: '', status: 'Active' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      role: item.role,
      department: item.department,
      email: item.email,
      status: item.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setStaffMembers(staffMembers.filter(item => item.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.role || !formData.email) return

    if (editingId) {
      setStaffMembers(staffMembers.map(item =>
        item.id === editingId
          ? { ...item, name: formData.name, role: formData.role, department: formData.department, email: formData.email, status: formData.status }
          : item
      ))
    } else {
      const newStaff = {
        id: `STF-${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        email: formData.email,
        status: formData.status,
      }
      setStaffMembers([newStaff, ...staffMembers])
    }

    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', role: '', department: 'Curatorial', email: '', status: 'Active' })
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Staff Directory</h1>
        </div>
        <button className="btn primary" onClick={handleOpenAdd}>
          Add Staff Member
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search staff name, role, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid var(--border, #ccc)',
            width: '280px',
            fontSize: '14px'
          }}
        />
        <span style={{ fontSize: '14px', color: '#666' }}>
          {filteredStaff.length} personnel listed
        </span>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border, #eee)', color: '#666' }}>
              <th style={{ padding: '12px 16px' }}>STAFF ID</th>
              <th style={{ padding: '12px 16px' }}>NAME</th>
              <th style={{ padding: '12px 16px' }}>ROLE</th>
              <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
              <th style={{ padding: '12px 16px' }}>EMAIL</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
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
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: item.status === 'Active' ? '#e6f4ea' : '#fef3c7',
                      color: item.status === 'Active' ? '#137333' : '#b45309'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleOpenEdit(item)}>
                        Edit
                      </button>
                      <button className="btn danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content card" style={{ width: '420px', padding: '24px', background: '#fff' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
              {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Job Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Assistant Curator"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Department</label>
                <select
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., j.doe@mfah.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editingId ? 'Save Changes' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}