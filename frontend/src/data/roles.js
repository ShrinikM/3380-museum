export const ROLES = {
  Admin: {
    pages: [
      '/dashboard',
      '/artists',
      '/artworks',
      '/collections',
      '/exhibitions',
      '/tickets',
      '/memberships',
      '/gift-shop',
      '/cafe',
      '/donations',
      '/staff',
      '/reports',
    ],
    edit: [
      '/artists',
      '/artworks',
      '/collections',
      '/exhibitions',
      '/tickets',
      '/memberships',
      '/gift-shop',
      '/cafe',
      '/donations',
      '/staff',
      '/reports',
    ],
  },

  Staff: {
    pages: [
      '/dashboard',
      '/artists',
      '/artworks',
      '/collections',
      '/exhibitions',
    ],
    edit: [
      '/artists',
      '/artworks',
      '/collections',
    ],
  },

  Operator: {
    pages: [
      '/dashboard',
      '/exhibitions',
      '/tickets',
      '/memberships',
      '/gift-shop',
      '/cafe',
    ],
    edit: [
      '/tickets',
      '/gift-shop',
      '/cafe',
    ],
  },

  Customer: {
    pages: ['/account'],
    edit: [],
  },
}

export const DEMO_LOGINS = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'staff', password: 'staff123', role: 'Staff' },
  { username: 'operator', password: 'operator123', role: 'Operator' },
  { username: 'customer', password: 'customer123', role: 'Customer' }
]