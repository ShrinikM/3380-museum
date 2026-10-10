export const TICKET_TYPES = ['Adult', 'Senior', 'Student', 'Child', 'Member']
export const MEMBERSHIP_TYPES = ['Individual', 'Family', 'Student', 'Senior']
export const ARTWORK_TYPES = ['Painting', 'Sculpture', 'Drawing', 'Print', 'Photography', 'Mixed Media']
export const STAFF_ROLES =['Admin', 'Curator', 'Exhibition Manager', 'Gift Shop', 'Ticket Desk', 'Cafe']

export const PAYMENT_METHODS = {
  membership: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],
  donations: ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer'],
  giftshopsale: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'],
  cafesale: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'],
}

export const MAX_CAPACITY = 1400
export const MAX_MONEY = 999999.99
export const LOW_STOCK = 5

export const DEFAULT_TICKET_PRICES = { Adult: 25, Senior: 18, Student: 15, Child: 10, Member: 12.5 }
export const DEFAULT_MEMBERSHIP_PRICES = { Individual: 85, Family: 150, Student: 45, Senior: 65 }