import{ useState } from 'react'
import{ Badge, StatCard } from './ui'

const giftShopItems = [
  { ItemID: 1, ItemName: 'Exhibition Catalogue: Jasper Johns', Category: 'Books', StaffID: 1, StaffName: 'Maya Patel', Price: 45, Stock: 32 },
  { ItemID: 2, ItemName: 'Water Lilies Tote Bag', Category: 'Accessories', StaffID: 1, StaffName: 'Maya Patel', Price: 24, Stock: 58 },
  { ItemID: 3, ItemName: 'MFAH Logo Mug', Category: 'Home', StaffID: 1, StaffName: 'Maya Patel', Price: 16, Stock: 120 },
  { ItemID: 4, ItemName: 'Art Postcard Set (12)', Category: 'Stationery', StaffID: 1, StaffName: 'Maya Patel', Price: 14, Stock: 200 },
  { ItemID: 5, ItemName: 'Silk Scarf - Kahlo Florals', Category: 'Accessories', StaffID: 1, StaffName: 'Maya Patel', Price: 68, Stock: 12 },
  { ItemID: 6, ItemName: "Kids' Watercolor Kit", Category: 'Kids', StaffID: 1, StaffName: 'Maya Patel', Price: 22, Stock: 40 },
  { ItemID: 7, ItemName: 'Framed Print: Migrant Mother', Category: 'Prints', StaffID: 1, StaffName: 'Maya Patel', Price: 95, Stock: 6 },
  { ItemID: 8, ItemName: 'Enamel Pin Set', Category: 'Accessories', StaffID: 1, StaffName: 'Maya Patel', Price: 12, Stock: 3 },
]

const cafeItems = [
  { ItemID: 1, ItemName: 'Cappuccino', Category: 'Beverages', StaffID: 2, StaffName: 'Carlos Vargas', Price: 5.5 },
  { ItemID: 2, ItemName: 'Cold Brew', Category: 'Beverages', StaffID: 2, StaffName: 'Carlos Vargas', Price: 5 },
  { ItemID: 3, ItemName: 'Butter Croissant', Category: 'Pastries', StaffID: 2, StaffName: 'Carlos Vargas', Price: 4.25 },
  { ItemID: 4, ItemName: 'Caprese Sandwich', Category: 'Sandwiches', StaffID: 2, StaffName: 'Carlos Vargas', Price: 11.5 },
  { ItemID: 5, ItemName: 'Seasonal Salad', Category: 'Salads', StaffID: 2, StaffName: 'Carlos Vargas', Price: 12 },
  { ItemID: 6, ItemName: 'Tomato Basil Soup', Category: 'Soups', StaffID: 2, StaffName: 'Carlos Vargas', Price: 7.5 },
  { ItemID: 7, ItemName: 'Chocolate Tart', Category: 'Desserts', StaffID: 2, StaffName: 'Carlos Vargas', Price: 6.75 },
  { ItemID: 8, ItemName: 'Sparkling Water', Category: 'Beverages', StaffID: 2, StaffName: 'Carlos Vargas', Price: 3 },
]

const giftShopSales = [
  { SaleID: 1, ItemID: 1, Quantity: 1, SalePrice: 45, SaleDate: '2026-09-03', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 1, MemberName: 'Patricia Holloway' },
  { SaleID: 2, ItemID: 3, Quantity: 2, SalePrice: 16, SaleDate: '2026-09-06', PaymentMethod: 'Cash', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 3, ItemID: 4, Quantity: 1, SalePrice: 14, SaleDate: '2026-09-12', PaymentMethod: 'Mobile Pay', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 4, ItemID: 2, Quantity: 1, SalePrice: 24, SaleDate: '2026-09-14', PaymentMethod: 'Debit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 2, MemberName: 'James Kowalski' },
  { SaleID: 5, ItemID: 6, Quantity: 2, SalePrice: 22, SaleDate: '2026-09-20', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 6, ItemID: 8, Quantity: 3, SalePrice: 12, SaleDate: '2026-09-22', PaymentMethod: 'Cash', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 7, ItemID: 5, Quantity: 1, SalePrice: 68, SaleDate: '2026-09-25', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 8, ItemID: 7, Quantity: 1, SalePrice: 95, SaleDate: '2026-09-28', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 3, MemberName: 'Aisha Okonkwo' },
]

const cafeSales = [
  { SaleID: 1, ItemID: 1, Quantity: 2, SalePrice: 5.5, SaleDate: '2026-09-05', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 2, ItemID: 4, Quantity: 1, SalePrice: 11.5, SaleDate: '2026-09-06', PaymentMethod: 'Mobile Pay', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: 1, MemberName: 'Patricia Holloway' },
  { SaleID: 3, ItemID: 3, Quantity: 3, SalePrice: 4.25, SaleDate: '2026-09-12', PaymentMethod: 'Cash', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 4, ItemID: 5, Quantity: 2, SalePrice: 12, SaleDate: '2026-09-14', PaymentMethod: 'Debit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 5, ItemID: 2, Quantity: 1, SalePrice: 5, SaleDate: '2026-09-20', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: 2, MemberName: 'James Kowalski' },
  { SaleID: 6, ItemID: 6, Quantity: 2, SalePrice: 7.5, SaleDate: '2026-09-22', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 7, ItemID: 7, Quantity: 1, SalePrice: 6.75, SaleDate: '2026-09-25', PaymentMethod: 'Cash', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 8, ItemID: 8, Quantity: 4, SalePrice: 3, SaleDate: '2026-09-27', PaymentMethod: 'Mobile Pay', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
]

function StorePage({ kind }){
  const isGiftShop = kind === 'giftshop'
  const title = isGiftShop ? 'Gift Shop' : 'Café'
  const items = isGiftShop ? giftShopItems : cafeItems
  const sales = isGiftShop ? giftShopSales : cafeSales

  const [tab, setTab] = useState('items')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [payment, setPayment] = useState('all')

  const categories = [...new Set(items.map((item)=> item.Category))].sort()
  const payments = ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay']

  const filteredItems = items.filter((item)=>{
    const text = `${item.ItemName} ${item.Category}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = category === 'all' || item.Category === category

    return matchesSearch && matchesCategory
  })

  const filteredSales = sales.filter((sale)=>{
    const item = items.find((item)=> item.ItemID === sale.ItemID)
    const text = `${sale.SaleID} ${item?.ItemName ?? ''} ${sale.PaymentMethod}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesPayment = payment === 'all' || sale.PaymentMethod === payment

    return matchesSearch && matchesPayment
  })

  const total = (sale)=> Number(sale.SalePrice) * sale.Quantity
  const revenue = sales.reduce((sum, sale)=> sum + total(sale), 0)

  return(
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            {isGiftShop
              ? 'Retail inventory, prices, and stock levels.'
              : 'Café menu items and prices.'}
          </p>
        </div>

        <button className="btn primary">
          {tab === 'items' ? 'Add Item' : 'Record Sale'}
        </button>
      </div>

      <div className="grid-4 section-gap-sm">
        <StatCard label="Items" value={items.length} />

        {isGiftShop
          ? <StatCard label="Units in Stock" value={items.reduce((sum, item)=> sum + item.Stock, 0)} />
          : <StatCard label="Categories" value={categories.length} />}

        {isGiftShop
          ? <StatCard label="Low Stock Items" value={items.filter((item)=> item.Stock < 5).length} />
          : <StatCard label="Sales Recorded" value={sales.length} />}

        <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>

      <div className="tabs">
        <button
          className={`tab${tab === 'items' ? ' active' : ''}`}
          onClick={()=> setTab('items')}
        >
          Items ({items.length})
        </button>

        <button
          className={`tab${tab === 'sales' ? ' active' : ''}`}
          onClick={()=> setTab('sales')}
        >
          Sales ({sales.length})
        </button>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder={tab === 'items' ? 'Search items...' : 'Search sales...'}
        />

        {tab === 'items' && (
          <select value={category} onChange={(e)=> setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category)=>(
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}

        {tab === 'sales' && (
          <select value={payment} onChange={(e)=> setPayment(e.target.value)}>
            <option value="all">All Payments</option>
            {payments.map((payment)=>(
              <option key={payment} value={payment}>{payment}</option>
            ))}
          </select>
        )}
      </div>

      <div className="card table-wrap">
        {tab === 'items' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                {isGiftShop && <th>Stock</th>}
                <th>Responsible Staff</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item)=>(
                <tr key={item.ItemID}>
                  <td className="strong">{item.ItemName}</td>
                  <td>{item.Category}</td>
                  <td className="mono">${item.Price.toFixed(2)}</td>

                  {isGiftShop && (
                    <td>
                      {item.Stock < 5 ? (
                        <>
                          <span className="strong">{item.Stock}</span>{' '}
                          <Badge variant="low" label="Low" />
                        </>
                      ) : item.Stock}
                    </td>
                  )}

                  <td className="muted">{item.StaffName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Sale Date</th>
                <th>Payment</th>
                <th>Staff</th>
                <th>Member</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale)=>{
                const item = items.find((item)=> item.ItemID === sale.ItemID)

                return(
                  <tr key={sale.SaleID}>
                    <td className="mono">#{String(sale.SaleID).padStart(5, '0')}</td>
                    <td className="strong">{item?.ItemName ?? '-'}</td>
                    <td>{sale.Quantity}</td>
                    <td className="mono">${sale.SalePrice.toFixed(2)}</td>
                    <td className="mono">${total(sale).toFixed(2)}</td>
                    <td className="mono">{sale.SaleDate}</td>
                    <td className="muted">{sale.PaymentMethod}</td>
                    <td className="muted">{sale.StaffName}</td>
                    <td>
                      {sale.MembershipID
                        ? <span className="chip chip-primary">{sale.MemberName}</span>
                        : <span className="muted">-</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StorePage