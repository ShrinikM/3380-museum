import{ useState } from 'react'
import{ Badge, StatCard, Modal } from './ui'

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
  { SaleID: 1, ItemID: 1, ItemName: 'Exhibition Catalogue: Jasper Johns', Quantity: 1, SalePrice: 45, SaleDate: '2026-09-03', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 1, MemberName: 'Patricia Holloway' },
  { SaleID: 2, ItemID: 3, ItemName: 'MFAH Logo Mug', Quantity: 2, SalePrice: 16, SaleDate: '2026-09-06', PaymentMethod: 'Cash', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 3, ItemID: 4, ItemName: 'Art Postcard Set (12)', Quantity: 1, SalePrice: 14, SaleDate: '2026-09-12', PaymentMethod: 'Mobile Pay', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 4, ItemID: 2, ItemName: 'Water Lilies Tote Bag', Quantity: 1, SalePrice: 24, SaleDate: '2026-09-14', PaymentMethod: 'Debit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 2, MemberName: 'James Kowalski' },
  { SaleID: 5, ItemID: 6, ItemName: "Kids' Watercolor Kit", Quantity: 2, SalePrice: 22, SaleDate: '2026-09-20', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 6, ItemID: 8, ItemName: 'Enamel Pin Set', Quantity: 3, SalePrice: 12, SaleDate: '2026-09-22', PaymentMethod: 'Cash', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 7, ItemID: 5, ItemName: 'Silk Scarf - Kahlo Florals', Quantity: 1, SalePrice: 68, SaleDate: '2026-09-25', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: null, MemberName: null },
  { SaleID: 8, ItemID: 7, ItemName: 'Framed Print: Migrant Mother', Quantity: 1, SalePrice: 95, SaleDate: '2026-09-28', PaymentMethod: 'Credit Card', StaffID: 1, StaffName: 'Maya Patel', MembershipID: 3, MemberName: 'Aisha Okonkwo' },
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

const giftShopCategories = [
  'Books',
  'Accessories',
  'Home',
  'Stationery',
  'Kids',
  'Prints'
]

const cafeCategories = [
  'Beverages',
  'Pastries',
  'Sandwiches',
  'Salads',
  'Soups',
  'Desserts'
]

function StorePage({ kind }){
  const today = new Date().toISOString().split('T')[0]
  const isGiftShop = kind === 'giftshop'
  const title = isGiftShop ? 'Gift Shop' : 'Café'
  const initialItems = isGiftShop ? giftShopItems : cafeItems
  const categories = isGiftShop ? giftShopCategories : cafeCategories
  const [items, setItems] = useState(initialItems)
  const [saleData, setSaleData] = useState([])
  const sales = [...(isGiftShop ? giftShopSales : cafeSales), ...saleData]

  const [tab, setTab] = useState('items')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [payment, setPayment] = useState('all')
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    ItemName: '',
    Category: '',
    Price: '',
    Stock: '',
    ItemID: '',
    Quantity: '',
    SaleDate: '',
    PaymentMethod: '',
    MembershipID: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if(tab === 'items'){
      const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' -]+$/

      if(!textPattern.test(formData.ItemName.trim())){
        alert('Item Name can only contain letters, numbers, spaces, hyphens, or apostrophes.')
        return
      }

      if(!formData.Category){
        alert('Please select a Category.')
        return
      }

      if(Number(formData.Price) <= 0){
        alert('Price must be greater than 0.')
        return
      }

      if(isGiftShop && Number(formData.Stock) < 0){
        alert('Stock cannot be negative.')
        return
      }

      const newItem = {
        ItemID: Math.max(...items.map((item)=> item.ItemID), 0) + 1,
        ItemName: formData.ItemName.trim(),
        Category: formData.Category,
        StaffID: isGiftShop ? 1 : 2,
        StaffName: isGiftShop ? 'Maya Patel' : 'Carlos Vargas',
        Price: Number(formData.Price),
        Stock: isGiftShop ? Number(formData.Stock) : undefined
      }

      setItems([...items, newItem])
    }
    else{
      if(!formData.ItemID){
        alert('Please select an Item.')
        return
      }

      if(Number(formData.Quantity) < 1){
        alert('Quantity must be at least 1.')
        return
      }

      if(formData.SaleDate > today){
        alert('Sale Date cannot be in the future.')
        return
      }

      if(!formData.PaymentMethod){
        alert('Please select a Payment Method.')
        return
      }

      if(formData.MembershipID && Number(formData.MembershipID) < 1){
        alert('Membership ID must be a positive number.')
        return
      }

      const item = items.find((item)=> item.ItemID === Number(formData.ItemID))
      if(isGiftShop && Number(formData.Quantity) > item.Stock){
        alert('There is not enough stock available.')
        return
      }

      const newSale = {
        SaleID: Math.max(...sales.map((sale)=> sale.SaleID), 0) + 1,
        ItemID: Number(formData.ItemID),
        ItemName: item.ItemName,
        Quantity: Number(formData.Quantity),
        SalePrice: item.Price,
        SaleDate: formData.SaleDate,
        PaymentMethod: formData.PaymentMethod,
        StaffID: isGiftShop ? 1 : 2,
        StaffName: isGiftShop ? 'Maya Patel' : 'Carlos Vargas',
        MembershipID: formData.MembershipID ? Number(formData.MembershipID) : null,
        MemberName: null
      }

      setSaleData([...saleData, newSale])
      if(isGiftShop){
        const newStock = item.Stock - Number(formData.Quantity)

        setItems(
          items
            .map((currentItem)=> 
              currentItem.ItemID === item.ItemID
                ? { ...currentItem, Stock: newStock }
                : currentItem
            )
            .filter((currentItem)=> currentItem.Stock > 0)
        )
      }
    }

    setFormData({
      ItemName: '',
      Category: '',
      Price: '',
      Stock: '',
      ItemID: '',
      Quantity: '',
      SaleDate: '',
      PaymentMethod: '',
      MembershipID: ''
    })

    setOpen(false)
  }

  const payments = ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay']

  const filteredItems = items.filter((item)=>{
    const text = `${item.ItemName} ${item.Category}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = category === 'all' || item.Category === category

    return matchesSearch && matchesCategory
  })

  const filteredSales = sales.filter((sale)=>{
    const text = `${sale.SaleID} ${sale.ItemName ?? ''} ${sale.PaymentMethod}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesPayment = payment === 'all' || sale.PaymentMethod === payment

    return matchesSearch && matchesPayment
  })

  const total = (sale)=> Number(sale.SalePrice) * sale.Quantity
  const handleDeleteSale = (saleID) => {
    const confirmed = window.confirm('Are you sure you want to delete this sale?')

    if(!confirmed){
      return
    }

    setSaleData(saleData.filter((sale)=> sale.SaleID !== saleID))
  }
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

        <button 
          className="btn primary" 
          onClick={()=>{
            setFormData({
              ItemName: '',
              Category: '',
              Price: '',
              Stock: '',
              ItemID: '',
              Quantity: '',
              SaleDate: '',
              PaymentMethod: '',
              MembershipID: ''
            })
            setOpen(true)
          }}
        >
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
                <th>Actions</th>
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
                  <td>
                    <button
                      className="btn danger"
                      onClick={()=>{
                        const confirmed = window.confirm('Are you sure you want to delete this item?')

                        if(!confirmed){
                          return
                        }

                        setItems(items.filter((currentItem)=> currentItem.ItemID !== item.ItemID))
                      }}
                    >
                      Delete
                    </button>
                  </td>
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale)=>(
                <tr key={sale.SaleID}>
                  <td className="mono">#{String(sale.SaleID).padStart(5, '0')}</td>
                  <td className="strong">{sale.ItemName ?? '-'}</td>
                  <td>{sale.Quantity}</td>
                  <td className="mono">${sale.SalePrice.toFixed(2)}</td>
                  <td className="mono">${total(sale).toFixed(2)}</td>
                  <td className="mono">{sale.SaleDate}</td>
                  <td className="muted">{sale.PaymentMethod}</td>
                  <td className="muted">{sale.StaffName}</td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={()=> handleDeleteSale(sale.SaleID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        title={tab === 'items' ? 'Add Item' : 'Record Sale'}
        onClose={()=> setOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          {tab === 'items' ? (
            <>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  name="ItemName"
                  value={formData.ItemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category)=>(
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  name="Price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.Price}
                  onChange={handleChange}
                  required
                />
              </div>

              {isGiftShop && (
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    name="Stock"
                    type="number"
                    min="0"
                    value={formData.Stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Item</label>
                <select
                  name="ItemID"
                  value={formData.ItemID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map((item)=>(
                    <option key={item.ItemID} value={item.ItemID}>
                      {item.ItemName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  name="Quantity"
                  type="number"
                  min="1"
                  value={formData.Quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sale Date</label>
                <input
                  name="SaleDate"
                  type="date"
                  max={today}
                  value={formData.SaleDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment</label>
                <select
                  name="PaymentMethod"
                  value={formData.PaymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment</option>
                  {payments.map((payment)=>(
                    <option key={payment} value={payment}>
                      {payment}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn secondary" 
              onClick={()=>{
                setFormData({
                  ItemName: '',
                  Category: '',
                  Price: '',
                  Stock: '',
                  ItemID: '',
                  Quantity: '',
                  SaleDate: '',
                  PaymentMethod: '',
                  MembershipID: ''
                })
                setOpen(false)
              }} 
            > 
              Cancel 
            </button>

            <button type="submit" className="btn primary">
              {tab === 'items' ? 'Add Item' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StorePage