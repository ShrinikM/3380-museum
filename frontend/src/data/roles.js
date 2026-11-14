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
      '/gift-shop',
      '/cafe',
    ],
    edit: [
      '/artists',
      '/artworks',
      '/collections',
      '/gift-shop',
      '/cafe',
    ],
  },


  Customer: {
    pages: ['/account'],
    edit: [],
  },
}