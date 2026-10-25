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

  Customer: {
    pages: ['/account'],
    edit: [],
  },
}

export const DEMO_LOGINS = [
  { username: 'admin@demo.test', password: 'admin123', role: 'Admin' },
  { username: 'staff@demo.test', password: 'staff123', role: 'Staff' },
]