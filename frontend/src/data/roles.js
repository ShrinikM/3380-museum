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
  { username: 'admin@demo.test', password: 'admin123', role: 'Admin' },
  { username: 'staff@demo.test', password: 'staff123', role: 'Staff' },
  { username: 'operator@demo.test', password: 'operator123', role: 'Operator' }
]