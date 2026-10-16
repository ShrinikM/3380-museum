import { useEffect, useState } from 'react'
import { StatCard, Modal } from './ui'

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
  { SaleID: 1, ItemID: 1, ItemName: 'Cappuccino', Quantity: 2, SalePrice: 5.5, SaleDate: '2026-09-05', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 2, ItemID: 4, ItemName: 'Caprese Sandwich', Quantity: 1, SalePrice: 11.5, SaleDate: '2026-09-06', PaymentMethod: 'Mobile Pay', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: 1, MemberName: 'Patricia Holloway' },
  { SaleID: 3, ItemID: 3, ItemName: 'Butter Croissant', Quantity: 3, SalePrice: 4.25, SaleDate: '2026-09-12', PaymentMethod: 'Cash', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 4, ItemID: 5, ItemName: 'Seasonal Salad', Quantity: 2, SalePrice: 12, SaleDate: '2026-09-14', PaymentMethod: 'Debit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 5, ItemID: 2, ItemName: 'Cold Brew', Quantity: 1, SalePrice: 5, SaleDate: '2026-09-20', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: 2, MemberName: 'James Kowalski' },
  { SaleID: 6, ItemID: 6, ItemName: 'Tomato Basil Soup', Quantity: 2, SalePrice: 7.5, SaleDate: '2026-09-22', PaymentMethod: 'Credit Card', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 7, ItemID: 7, ItemName: 'Chocolate Tart', Quantity: 1, SalePrice: 6.75, SaleDate: '2026-09-25', PaymentMethod: 'Cash', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
  { SaleID: 8, ItemID: 8, ItemName: 'Sparkling Water', Quantity: 4, SalePrice: 3, SaleDate: '2026-09-27', PaymentMethod: 'Mobile Pay', StaffID: 2, StaffName: 'Carlos Vargas', MembershipID: null, MemberName: null },
]

const giftShopCategories = [
  'Books',
  'Accessories',
  'Home',
  'Stationery',
  'Kids',
  'Prints',
]

const cafeCategories = [
  'Beverages',
  'Pastries',
  'Sandwiches',
  'Salads',
  'Soups',
  'Desserts',
]

const emptyForm = {
  ItemName: '',
  Category: '',
  Price: '',
  Stock: '',
  ItemID: '',
  Quantity: '',
  SaleDate: '',
  PaymentMethod: '',
  MembershipID: '',
}

function StorePage({ kind }) {
  const today = new Date().toISOString().split('T')[0]
  const isGiftShop = kind === 'giftshop'
  const title = isGiftShop ? 'Gift Shop' : 'Café'
  const categories = isGiftShop ? giftShopCategories : cafeCategories

  const [items, setItems] = useState([])
  const [sales, setSales] = useState([])
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    let cancelled = false

    async function loadStoreData() {
      try {
        setLoadError('')

        const [itemsResponse, salesResponse] = await Promise.all([
          fetch(`/api/store/${kind}/items`),
          fetch(`/api/store/${kind}/sales`),
        ])

        if (!itemsResponse.ok || !salesResponse.ok) {
          throw new Error('Could not load store data from the server.')
        }

        const [itemsData, salesData] = await Promise.all([
          itemsResponse.json(),
          salesResponse.json(),
        ])

        if (cancelled) return

        setItems(
          itemsData.map((item) => ({
            ...item,
            Price: Number(item.Price),
            ...(item.Stock !== undefined
              ? { Stock: Number(item.Stock) }
              : {}),
          }))
        )

        setSales(
          salesData.map((sale) => ({
            ...sale,
            SalePrice: Number(sale.SalePrice),
            Quantity: Number(sale.Quantity),
          }))
        )
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message)
        }
      }
    }

    loadStoreData()

    return () => {
      cancelled = true
    }
  }, [kind])


  const [tab, setTab] = useState('items')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [payment, setPayment] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const payments = ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay']

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
  }

  const closeModal = () => {
    resetForm()
    setOpen(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const openAddModal = () => {
    resetForm()
    setOpen(true)
  }

  const openEditModal = (item) => {
    setEditingId(item.ItemID)
    setFormData({
      ...emptyForm,
      ItemName: item.ItemName,
      Category: item.Category,
      Price: String(item.Price),
      Stock: isGiftShop ? String(item.Stock) : '',
    })
    setOpen(true)
  }

  const openEditSaleModal = (sale) => {
    setEditingId(sale.SaleID)
    setFormData({
      ...emptyForm,
      ItemID: String(sale.ItemID),
      Quantity: String(sale.Quantity),
      SaleDate: sale.SaleDate,
      PaymentMethod: sale.PaymentMethod,
      MembershipID: sale.MembershipID
        ? String(sale.MembershipID)
        : '',
    })
    setOpen(true)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (tab === 'items') {
      const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' -]+$/

      if (!textPattern.test(formData.ItemName.trim())) {
        alert(
          'Item Name can only contain letters, numbers, spaces, hyphens, or apostrophes.'
        )
        return
      }

      if (!formData.Category) {
        alert('Please select a Category.')
        return
      }

      if (
        !Number.isFinite(Number(formData.Price)) ||
        Number(formData.Price) <= 0
      ) {
        alert('Price must be greater than 0.')
        return
      }

      if (
        isGiftShop &&
        (!formData.Stock ||
          !Number.isInteger(Number(formData.Stock)) ||
          Number(formData.Stock) < 0)
      ) {
        if (formData.Stock !== '0') {
          alert('Stock must be a non-negative whole number.')
          return
        }
      }

      const itemData = {
        ItemName: formData.ItemName.trim(),
        Category: formData.Category,
        Price: Number(formData.Price),
        StaffID: isGiftShop ? 1 : 2,
        ...(isGiftShop ? { Stock: Number(formData.Stock) } : {}),
      }

      try {
        const url =
          editingId === null
            ? `/api/store/${kind}/items`
            : `/api/store/${kind}/items/${editingId}`

        const response = await fetch(url, {
          method: editingId === null ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Could not save the item.')
        }

        const itemsResponse = await fetch(`/api/store/${kind}/items`)

        if (!itemsResponse.ok) {
          throw new Error(
            'Item saved, but the item list could not be refreshed.'
          )
        }

        const itemsData = await itemsResponse.json()

        setItems(
          itemsData.map((item) => ({
            ...item,
            Price: Number(item.Price),
            ...(item.Stock !== undefined
              ? { Stock: Number(item.Stock) }
              : {}),
          }))
        )

        closeModal()
      } catch (error) {
        alert(error.message)
      }

      return
    } else {
      if (!formData.ItemID) {
        alert('Please select an Item.')
        return
      }

      if (
        !Number.isInteger(Number(formData.Quantity)) ||
        Number(formData.Quantity) < 1
      ) {
        alert('Quantity must be at least 1.')
        return
      }

      if (!formData.SaleDate) {
        alert('Please select a Sale Date.')
        return
      }

      if (formData.SaleDate > today) {
        alert('Sale Date cannot be in the future.')
        return
      }

      if (!formData.PaymentMethod) {
        alert('Please select a Payment Method.')
        return
      }

      if (
        formData.MembershipID &&
        (!Number.isInteger(Number(formData.MembershipID)) ||
          Number(formData.MembershipID) < 1)
      ) {
        alert('Membership ID must be a positive whole number.')
        return
      }

      const item = items.find(
        (currentItem) =>
          Number(currentItem.ItemID) === Number(formData.ItemID)
      )

      if (!item) {
        alert('Please select a valid Item.')
        return
      }

      const originalSale =
        editingId !== null
          ? sales.find(
            (sale) => Number(sale.SaleID) === Number(editingId)
          )
          : null

      if (editingId !== null && !originalSale) {
        alert('Could not find the sale you are editing. Refresh and try again.')
        return
      }

      if (isGiftShop) {
        const availableStock =
          originalSale &&
            Number(originalSale.ItemID) === Number(item.ItemID)
            ? Number(item.Stock) + Number(originalSale.Quantity)
            : Number(item.Stock)

        if (Number(formData.Quantity) > availableStock) {
          alert('There is not enough stock available.')
          return
        }
      }

      const saleDataToSave = {
        ItemID: Number(formData.ItemID),
        Quantity: Number(formData.Quantity),
        SaleDate: formData.SaleDate,
        PaymentMethod: formData.PaymentMethod,
        StaffID: isGiftShop ? 1 : 2,
        MembershipID: formData.MembershipID
          ? Number(formData.MembershipID)
          : null,
      }

      try {
        const url =
          editingId === null
            ? `/api/store/${kind}/sales`
            : `/api/store/${kind}/sales/${editingId}`

        const response = await fetch(url, {
          method: editingId === null ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleDataToSave),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Could not save the sale.')
        }

        const [salesResponse, itemsResponse] = await Promise.all([
          fetch(`/api/store/${kind}/sales`),
          fetch(`/api/store/${kind}/items`),
        ])

        if (!salesResponse.ok || !itemsResponse.ok) {
          throw new Error(
            'Sale saved, but the lists could not be refreshed.'
          )
        }

        const [salesData, itemsData] = await Promise.all([
          salesResponse.json(),
          itemsResponse.json(),
        ])

        setSales(
          salesData.map((sale) => ({
            ...sale,
            SalePrice: Number(sale.SalePrice),
            Quantity: Number(sale.Quantity),
          }))
        )

        setItems(
          itemsData.map((item) => ({
            ...item,
            Price: Number(item.Price),
            ...(item.Stock !== undefined
              ? { Stock: Number(item.Stock) }
              : {}),
          }))
        )

        closeModal()
      } catch (error) {
        alert(error.message)
      }

      return
    }
  }




  const handleDeleteSale = async (saleID) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sale?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `/api/store/${kind}/sales/${saleID}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete sale.')
      }

      const [salesResponse, itemsResponse] = await Promise.all([
        fetch(`/api/store/${kind}/sales`),
        fetch(`/api/store/${kind}/items`),
      ])

      if (!salesResponse.ok || !itemsResponse.ok) {
        throw new Error(
          'Sale deleted, but the lists could not be refreshed.'
        )
      }

      const [salesData, itemsData] = await Promise.all([
        salesResponse.json(),
        itemsResponse.json(),
      ])

      setSales(
        salesData.map((sale) => ({
          ...sale,
          SalePrice: Number(sale.SalePrice),
          Quantity: Number(sale.Quantity),
        }))
      )

      setItems(
        itemsData.map((item) => ({
          ...item,
          Price: Number(item.Price),
          ...(item.Stock !== undefined
            ? { Stock: Number(item.Stock) }
            : {}),
        }))
      )
    } catch (error) {
      window.alert(error.message)
    }
  }




  const handleDeleteItem = async (itemID) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this item?'
    )

    if (!confirmed) {
      return
    }

    const hasSales = sales.some(
      (sale) => sale.ItemID === itemID
    )

    if (hasSales) {
      alert(
        'This item has sales records. Delete those sales before deleting the item.'
      )
      return
    }

    try {
      const response = await fetch(
        `/api/store/${kind}/items/${itemID}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Could not delete the item.')
      }

      const itemsResponse = await fetch(
        `/api/store/${kind}/items`
      )

      if (!itemsResponse.ok) {
        throw new Error(
          'Item deleted, but the item list could not be refreshed.'
        )
      }

      const itemsData = await itemsResponse.json()

      setItems(
        itemsData.map((item) => ({
          ...item,
          Price: Number(item.Price),
          ...(item.Stock !== undefined
            ? { Stock: Number(item.Stock) }
            : {}),
        }))
      )
    } catch (error) {
      alert(error.message)
    }
  }


  const filteredItems = items.filter((item) => {
    const text = `${item.ItemName} ${item.Category}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory =
      category === 'all' || item.Category === category

    return matchesSearch && matchesCategory
  })

  const filteredSales = sales.filter((sale) => {
    const text = `${sale.SaleID} ${sale.ItemName ?? ''} ${sale.PaymentMethod}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesPayment =
      payment === 'all' || sale.PaymentMethod === payment

    return matchesSearch && matchesPayment
  })

  const total = (sale) => Number(sale.SalePrice) * sale.Quantity
  const revenue = sales.reduce((sum, sale) => sum + total(sale), 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
        </div>
        {loadError && (
          <p role="alert">{loadError}</p>
        )}

        <button
          className="btn primary"
          onClick={openAddModal}
        >
          {tab === 'items' ? 'Add Item' : 'Record Sale'}
        </button>
      </div>

      <div className="grid-4 section-gap-sm">
        <StatCard label="Items" value={items.length} />

        {isGiftShop ? (
          <StatCard
            label="Units in Stock"
            value={items.reduce((sum, item) => sum + item.Stock, 0)}
          />
        ) : (
          <StatCard label="Categories" value={categories.length} />
        )}

        {isGiftShop ? (
          <StatCard
            label="Low Stock Items"
            value={items.filter((item) => item.Stock < 5).length}
          />
        ) : (
          <StatCard label="Sales Recorded" value={sales.length} />
        )}

        <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>

      <div className="tabs">
        <button
          className={`tab${tab === 'items' ? ' active' : ''}`}
          onClick={() => {
            setTab('items')
            resetForm()
          }}
        >
          Items ({items.length})
        </button>

        <button
          className={`tab${tab === 'sales' ? ' active' : ''}`}
          onClick={() => {
            setTab('sales')
            resetForm()
          }}
        >
          Sales ({sales.length})
        </button>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'items' ? 'Search items...' : 'Search sales...'}
        />

        {tab === 'items' && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((itemCategory) => (
              <option key={itemCategory} value={itemCategory}>
                {itemCategory}
              </option>
            ))}
          </select>
        )}

        {tab === 'sales' && (
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="all">All Payments</option>
            {payments.map((paymentMethod) => (
              <option key={paymentMethod} value={paymentMethod}>
                {paymentMethod}
              </option>
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
              {filteredItems.map((item) => (
                <tr key={item.ItemID}>
                  <td className="strong">{item.ItemName}</td>
                  <td>{item.Category}</td>
                  <td className="mono">${item.Price.toFixed(2)}</td>

                  {isGiftShop && (
                    <td>
                      <span className="strong">{item.Stock}</span>
                    </td>
                  )}

                  <td className="muted">{item.StaffName}</td>

                  <td>
                    <div className="row-actions">
                      <button
                        className="btn secondary"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn danger"
                        onClick={() => handleDeleteItem(item.ItemID)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={isGiftShop ? 6 : 5} className="empty">
                    No items found.
                  </td>
                </tr>
              )}
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
              {filteredSales.map((sale) => (
                <tr key={sale.SaleID}>
                  <td className="mono">
                    #{String(sale.SaleID).padStart(5, '0')}
                  </td>
                  <td className="strong">{sale.ItemName ?? '-'}</td>
                  <td>{sale.Quantity}</td>
                  <td className="mono">${sale.SalePrice.toFixed(2)}</td>
                  <td className="mono">${total(sale).toFixed(2)}</td>
                  <td className="mono">{sale.SaleDate}</td>
                  <td className="muted">{sale.PaymentMethod}</td>
                  <td className="muted">{sale.StaffName}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn secondary"
                        onClick={() => openEditSaleModal(sale)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn danger"
                        onClick={() => handleDeleteSale(sale.SaleID)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty">
                    No sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        title={
          tab === 'items'
            ? editingId === null ? 'Add Item' : 'Edit Item'
            : editingId === null ? 'Record Sale' : 'Edit Sale'
        }
        onClose={closeModal}
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
                  {categories.map((itemCategory) => (
                    <option key={itemCategory} value={itemCategory}>
                      {itemCategory}
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
                    step="1"
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
                  {items.map((item) => (
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
                  step="1"
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
                  {payments.map((paymentMethod) => (
                    <option key={paymentMethod} value={paymentMethod}>
                      {paymentMethod}
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
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {tab === 'items'
                ? editingId === null ? 'Add Item' : 'Save Changes'
                : editingId === null ? 'Record Sale' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StorePage