import { useCallback, useEffect, useState } from 'react'
import { Panel, Modal, SelectionActions } from './ui'
import { useSelection } from '../hooks/useSelection'
import { callApi } from '../api'
import { PAYMENT_METHODS, LOW_STOCK } from '../data/constants'

const STORES = {
  giftshop: {
    title: 'Gift Shop',
    name: 'gift shop',
    staffId: 1,
    payments: PAYMENT_METHODS.giftshopsale,
    categories: ['Books', 'Accessories', 'Home', 'Stationery', 'Kids', 'Prints'],
  },
  cafe: {
    title: 'Café',
    name: 'café',
    staffId: 2,
    payments: PAYMENT_METHODS.cafesale,
    categories: ['Beverages', 'Pastries', 'Sandwiches', 'Salads', 'Soups', 'Desserts'],
  },
}

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' -]+$/

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

// Local date as YYYY-MM-DD (toISOString would give the UTC date)
function localToday(){
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function toItem(item){
  return {
    ...item,
    Price: Number(item.Price),
    ...(item.Stock !== undefined ? { Stock: Number(item.Stock) } : {}),
  }
}

function toSale(sale){
  return {
    ...sale,
    SalePrice: Number(sale.SalePrice),
    Quantity: Number(sale.Quantity),
  }
}

function saleTotal(sale){
  return sale.SalePrice * sale.Quantity
}

function StorePage({ kind }){
  const store = STORES[kind]
  const isGiftShop = kind === 'giftshop'
  const base = `/api/store/${kind}`
  const today = localToday()

  const [items, setItems] = useState([])
  const [sales, setSales] = useState([])
  const [loadError, setLoadError] = useState('')

  const [tab, setTab] = useState('items')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const loadStoreData = useCallback(async()=>{
    const [itemsData, salesData] = await Promise.all([
      callApi(`${base}/items`, 'GET'),
      callApi(`${base}/sales`, 'GET'),
    ])

    setItems(itemsData.map(toItem))
    setSales(salesData.map(toSale))
    setLoadError('')
  }, [base])

  useEffect(()=>{
    loadStoreData().catch((error)=>setLoadError(error.message))
  }, [loadStoreData])

  const query = search.toLowerCase()

  const filteredItems = items.filter((item)=>
    `${item.ItemName} ${item.Category}`.toLowerCase().includes(query)
  )

  const filteredSales = sales.filter((sale)=>
    `${sale.SaleID} ${sale.ItemName ?? ''} ${sale.PaymentMethod}`.toLowerCase().includes(query)
  )

  const itemSelection = useSelection(filteredItems, (item)=>item.ItemID)
  const saleSelection = useSelection(filteredSales, (sale)=>sale.SaleID)
  const selection = tab === 'items' ? itemSelection : saleSelection

  const revenue = sales.reduce((sum, sale)=>sum + saleTotal(sale), 0)

  // Form

  const openModal = (values, id)=>{
    setFormData({ ...emptyForm, ...values })
    setEditingId(id)
    setFormError('')
    setOpen(true)
  }

  const closeModal = ()=>{
    setOpen(false)
    setFormData(emptyForm)
    setEditingId(null)
    setFormError('')
  }

  const handleChange = (e)=>{
    const { name, value } = e.target
    setFormData((current)=>({ ...current, [name]: value }))
  }

  const openAddModal = ()=>openModal({}, null)

  const openEditItem = (item)=>{
    openModal({
      ItemName: item.ItemName,
      Category: item.Category,
      Price: String(item.Price),
      Stock: isGiftShop ? String(item.Stock) : '',
    }, item.ItemID)
  }

  const openEditSale = (sale)=>{
    openModal({
      ItemID: String(sale.ItemID),
      Quantity: String(sale.Quantity),
      SaleDate: sale.SaleDate,
      PaymentMethod: sale.PaymentMethod,
      MembershipID: sale.MembershipID ? String(sale.MembershipID) : '',
    }, sale.SaleID)
  }

  const validateItem = ()=>{
    const stock = Number(formData.Stock)

    if(!NAME_PATTERN.test(formData.ItemName.trim())){
      return 'Item Name can only contain letters, numbers, spaces, hyphens, or apostrophes.'
    }

    if(!formData.Category){
      return 'Please select a Category.'
    }

    if(!(Number(formData.Price) > 0)){
      return 'Price must be greater than 0.'
    }

    if(isGiftShop && (formData.Stock === '' || !Number.isInteger(stock) || stock < 0)){
      return 'Stock must be a non-negative whole number.'
    }

    return ''
  }

  const validateSale = ()=>{
    const quantity = Number(formData.Quantity)
    const membershipId = Number(formData.MembershipID)
    const item = items.find((current)=>Number(current.ItemID) === Number(formData.ItemID))

    if(!item){
      return 'Please select an Item.'
    }

    if(!Number.isInteger(quantity) || quantity < 1){
      return 'Quantity must be at least 1.'
    }

    if(!formData.SaleDate){
      return 'Please select a Sale Date.'
    }

    if(formData.SaleDate > today){
      return 'Sale Date cannot be in the future.'
    }

    if(!formData.PaymentMethod){
      return 'Please select a Payment Method.'
    }

    if(formData.MembershipID && (!Number.isInteger(membershipId) || membershipId < 1)){
      return 'Membership ID must be a positive whole number.'
    }

    if(isGiftShop){
      // When editing, the original sale's quantity goes back into stock first
      const original = sales.find((sale)=>Number(sale.SaleID) === Number(editingId))
      const returned = original && Number(original.ItemID) === Number(item.ItemID)
        ? original.Quantity
        : 0

      if(quantity > item.Stock + returned){
        return 'There is not enough stock available.'
      }
    }

    return ''
  }

  const buildItem = ()=>({
    ItemName: formData.ItemName.trim(),
    Category: formData.Category,
    Price: Number(formData.Price),
    StaffID: store.staffId,
    ...(isGiftShop ? { Stock: Number(formData.Stock) } : {}),
  })

  const buildSale = ()=>({
    ItemID: Number(formData.ItemID),
    Quantity: Number(formData.Quantity),
    SaleDate: formData.SaleDate,
    PaymentMethod: formData.PaymentMethod,
    StaffID: store.staffId,
    MembershipID: formData.MembershipID ? Number(formData.MembershipID) : null,
  })

  const handleSubmit = async (e)=>{
    e.preventDefault()

    const isItem = tab === 'items'
    const error = isItem ? validateItem() : validateSale()

    if(error){
      setFormError(error)
      return
    }

    const path = isItem ? `${base}/items` : `${base}/sales`
    const url = editingId === null ? path : `${path}/${editingId}`
    const method = editingId === null ? 'POST' : 'PUT'

    try{
      await callApi(url, method, isItem ? buildItem() : buildSale())
    }
    catch(saveError){
      setFormError(saveError.message)
      return
    }

    closeModal()
    selection.clear()

    try{
      await loadStoreData()
    }
    catch{
      setLoadError('Saved, but the lists could not be refreshed.')
    }
  }

  // Delete

  const deleteItem = async (item)=>{
    const hasSales = sales.some((sale)=>Number(sale.ItemID) === Number(item.ItemID))

    if(hasSales){
      throw new Error('This item has sales records. Delete those sales before deleting the item.')
    }

    await callApi(`${base}/items/${item.ItemID}`, 'DELETE')
  }

  const deleteSale = async (sale)=>{
    await callApi(`${base}/sales/${sale.SaleID}`, 'DELETE')
  }

  const handleEditSelected = ()=>{
    if(tab === 'items'){
      openEditItem(itemSelection.selectedRows[0])
    }
    else{
      openEditSale(saleSelection.selectedRows[0])
    }
  }

  const handleDeleteSelected = async ()=>{
    const deleted = tab === 'items'
      ? await itemSelection.deleteSelected('item', (item)=>item.ItemName, deleteItem)
      : await saleSelection.deleteSelected('sale', (sale)=>`Sale ${sale.SaleID}`, deleteSale)

    if(!deleted){
      return
    }

    try{
      await loadStoreData()
    }
    catch{
      setLoadError('Deleted, but the lists could not be refreshed.')
    }
  }

  const switchTab = (name)=>{
    setTab(name)
    itemSelection.clear()
    saleSelection.clear()
  }

  const isNew = editingId === null
  const modalTitle = tab === 'items'
    ? (isNew ? 'Add Item' : 'Edit Item')
    : (isNew ? 'Record Sale' : 'Edit Sale')
  const submitLabel = isNew ? modalTitle : 'Save Changes'

  return (
    <div className="page page-wide">
      <div className="page-header">
        <h1 className="page-title">{store.title}</h1>

        <div className="page-header-actions">
          <SelectionActions
            count={selection.selectedRows.length}
            onEdit={handleEditSelected}
            onDelete={handleDeleteSelected}
          />

          <button type="button" className="btn primary" onClick={openAddModal}>
            {tab === 'items' ? 'Add Item' : 'Record Sale'}
          </button>
        </div>
      </div>

      <div className="grid-4 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">{items.length.toLocaleString()}</div>
          <div className="summary-label">Items</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {isGiftShop
              ? items.reduce((sum, item)=>sum + item.Stock, 0).toLocaleString()
              : store.categories.length}
          </div>
          <div className="summary-label">{isGiftShop ? 'Units in Stock' : 'Categories'}</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {isGiftShop
              ? items.filter((item)=>item.Stock < LOW_STOCK).length
              : sales.length}
          </div>
          <div className="summary-label">{isGiftShop ? 'Low Stock Items' : 'Sales Recorded'}</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">${revenue.toFixed(2)}</div>
          <div className="summary-label">Revenue</div>
        </Panel>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab${tab === 'items' ? ' active' : ''}`}
          onClick={()=>switchTab('items')}
        >
          Items ({items.length})
        </button>

        <button
          type="button"
          className={`tab${tab === 'sales' ? ' active' : ''}`}
          onClick={()=>switchTab('sales')}
        >
          Sales ({sales.length})
        </button>
      </div>

      <div className="toolbar">
        <label htmlFor="store-search" className="sr-only">
          Search {tab === 'items' ? 'items' : 'sales'}
        </label>

        <input
          id="store-search"
          name="storeSearch"
          type="search"
          className="search-input"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder={tab === 'items' ? 'Search items...' : 'Search sales...'}
        />
      </div>

      {loadError && (
        <p className="load-error" role="alert">
          Could not load {store.name}: {loadError}
        </p>
      )}

      {tab === 'items' ? (
        <div className="card table-wrap">
          <table className={`data-table${itemSelection.selectedRows.length > 0 ? ' selecting' : ''}`}>
            <caption className="sr-only">{store.title} items</caption>
            <thead>
              <tr>
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col">Item</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                {isGiftShop && <th scope="col">Stock</th>}
                <th scope="col">Staff</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item)=>(
                <tr
                  key={item.ItemID}
                  className={itemSelection.isSelected(item.ItemID) ? 'selected-row' : ''}
                >
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={itemSelection.isSelected(item.ItemID)}
                      onChange={()=>itemSelection.toggle(item.ItemID)}
                      aria-label={`Select ${item.ItemName}`}
                    />
                  </td>
                  <td className="strong">{item.ItemName}</td>
                  <td>{item.Category}</td>
                  <td className="mono">${item.Price.toFixed(2)}</td>
                  {isGiftShop && <td className="mono">{item.Stock}</td>}
                  <td>{item.StaffName}</td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={isGiftShop ? 6 : 5} className="empty">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className={`data-table${saleSelection.selectedRows.length > 0 ? ' selecting' : ''}`}>
            <caption className="sr-only">{store.title} sales</caption>
            <thead>
              <tr>
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col">Sale</th>
                <th scope="col">Item</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
                <th scope="col">Sale Date</th>
                <th scope="col">Payment</th>
                <th scope="col">Customer</th>
                <th scope="col">Staff</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale)=>(
                <tr
                  key={sale.SaleID}
                  className={saleSelection.isSelected(sale.SaleID) ? 'selected-row' : ''}
                >
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={saleSelection.isSelected(sale.SaleID)}
                      onChange={()=>saleSelection.toggle(sale.SaleID)}
                      aria-label={`Select sale ${sale.SaleID}`}
                    />
                  </td>
                  <td className="mono">#{String(sale.SaleID).padStart(5, '0')}</td>
                  <td>{sale.ItemName}</td>
                  <td className="mono">{sale.Quantity}</td>
                  <td className="mono">${saleTotal(sale).toFixed(2)}</td>
                  <td className="mono">{sale.SaleDate}</td>
                  <td>{sale.PaymentMethod}</td>
                  <td>{sale.CustomerName || <span className="cell-sub">Walk-in</span>}</td>
                  <td>{sale.StaffName}</td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty">No sales found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={modalTitle} onClose={closeModal}>
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          {tab === 'items' ? (
            <>
              <div className="form-group">
                <label htmlFor="store-item-name">Item Name</label>
                <input
                  id="store-item-name"
                  name="ItemName"
                  value={formData.ItemName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="store-item-category">Category</label>
                <select
                  id="store-item-category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {store.categories.map((category)=>(
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="store-item-price">Price</label>
                <input
                  id="store-item-price"
                  name="Price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.Price}
                  onChange={handleChange}
                />
              </div>

              {isGiftShop && (
                <div className="form-group">
                  <label htmlFor="store-item-stock">Stock</label>
                  <input
                    id="store-item-stock"
                    name="Stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.Stock}
                    onChange={handleChange}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="store-sale-item">Item</label>
                <select
                  id="store-sale-item"
                  name="ItemID"
                  value={formData.ItemID}
                  onChange={handleChange}
                >
                  <option value="">Select Item</option>
                  {items.map((item)=>(
                    <option key={item.ItemID} value={item.ItemID}>{item.ItemName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="store-sale-quantity">Quantity</label>
                <input
                  id="store-sale-quantity"
                  name="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.Quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="store-sale-date">Sale Date</label>
                <input
                  id="store-sale-date"
                  name="SaleDate"
                  type="date"
                  max={today}
                  value={formData.SaleDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="store-sale-payment">Payment</label>
                <select
                  id="store-sale-payment"
                  name="PaymentMethod"
                  value={formData.PaymentMethod}
                  onChange={handleChange}
                >
                  <option value="">Select Payment</option>
                  {store.payments.map((method)=>(
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="store-sale-membership">Membership ID</label>
                <input
                  id="store-sale-membership"
                  name="MembershipID"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.MembershipID}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={closeModal}>
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StorePage