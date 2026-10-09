export const ROLES = {
  Admin: {
    pages: [
      '/artists', '/artworks', '/collections', '/exhibitions',
      '/tickets', '/memberships', '/gift-shop', '/cafe',
      '/donations', '/staff',
    ],
    edit: [
      '/artists', '/artworks', '/collections', '/exhibitions',
      '/tickets', '/memberships', '/gift-shop', '/cafe',
      '/donations', '/staff',
    ],
  },
  Supervisor: {
    pages: [
      '/artists', '/artworks', '/collections', '/exhibitions',
      '/tickets', '/memberships', '/gift-shop', '/cafe',
      '/donations', '/staff',
    ],
    edit: [
      '/artists', '/artworks', '/collections', '/exhibitions',
      '/tickets', '/memberships', '/gift-shop', '/cafe',
    ],
  },
  Staff: {
    pages: ['/artists', '/artworks', '/collections', '/exhibitions'],
    edit: ['/artists', '/artworks', '/collections'],
  },
  Operator: {
    pages: ['/exhibitions', '/tickets', '/memberships', '/gift-shop', '/cafe'],
    edit: ['/tickets', '/gift-shop', '/cafe'],
  },
}

export const DEMO_LOGINS = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'supervisor', password: 'supervisor123', role: 'Supervisor' },
  { username: 'staff', password: 'staff123', role: 'Staff' },
  { username: 'operator', password: 'operator123', role: 'Operator' },
]
