import { useCallback, useEffect, useState } from 'react'
import { callApi } from '../api'
import { useRole } from '../context/role'
import './CustomerPage.css'

const TABS = [
  { id: 'membership', label: 'My Membership' },
  { id: 'tickets', label: 'Buy Tickets' },
  { id: 'shop', label: 'Gift Shop' },
]

const ONLINE_PAYMENTS = ['Credit Card', 'Debit Card', 'Mobile Pay']
const MAX_PER_ORDER = 20

const STATUS_TEXT = {
  active: 'Active',
  upcoming: 'Starts soon',
  expired: 'Expired',
}

function money(value){
  return `$${Number(value).toFixed(2)}`
}

function formatDate(value){
  if(!value){
    return ''
  }

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Stepper({ value, max, onChange, label }){
  return (
    <div className="cp-stepper">
      <button
        type="button"
        onClick={()=>onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`Fewer ${label}`}
      >
        -
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={()=>onChange(value + 1)}
        disabled={value >= max}
        aria-label={`More ${label}`}
      >
        +
      </button>
    </div>
  )
}


function MembershipTab({ account }){
  const { membership, tickets, orders } = account
  const isActive = membership.Status === 'active'

  return (
    <div className="cp-stack">
      <section className="cp-card cp-member">
        <div className="cp-member-head">
          <div>
            <div className="cp-label">Membership</div>
            <h2>{membership.MembershipType}</h2>
          </div>
          <span className={`cp-status is-${membership.Status}`}>
            {STATUS_TEXT[membership.Status]}
          </span>
        </div>

        <dl className="cp-details">
          <div>
            <dt>Member</dt>
            <dd>{membership.FirstName} {membership.LastName}</dd>
          </div>
          <div>
            <dt>Member ID</dt>
            <dd>#{String(membership.MembershipID).padStart(5, '0')}</dd>
          </div>
          <div>
            <dt>Valid</dt>
            <dd>{formatDate(membership.StartDate)} - {formatDate(membership.EndDate)}</dd>
          </div>
          <div>
            <dt>Ticket discount</dt>
            <dd>{isActive ? `${membership.DiscountPercent}%` : 'None while inactive'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{membership.Email}</dd>
          </div>
          {membership.Phone && (
            <div>
              <dt>Phone</dt>
              <dd>{membership.Phone}</dd>
            </div>
          )}
        </dl>

        {membership.Status === 'expired' && (
          <p className="cp-note">Your membership has expired. You can renew it at the front desk.</p>
        )}
      </section>

      <section className="cp-card">
        <h2>My Tickets</h2>

        {tickets.length === 0 ? (
          <p className="cp-empty">You haven't bought any tickets yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Exhibition</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price</th>
                  <th scope="col">Bought</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket)=>(
                  <tr key={ticket.TicketID}>
                    <td className="strong">{ticket.ExhibitionName}</td>
                    <td>{ticket.TicketType}</td>
                    <td>{money(ticket.Price)}</td>
                    <td>{formatDate(ticket.SaleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cp-card">
        <h2>My Orders</h2>

        {orders.length === 0 ? (
          <p className="cp-empty">You haven't ordered anything from the gift shop yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order)=>(
                  <tr key={order.SaleID}>
                    <td className="strong">{order.ItemName}</td>
                    <td>{order.Quantity}</td>
                    <td>{money(order.Total)}</td>
                    <td>{order.PaymentMethod}</td>
                    <td>{formatDate(order.SaleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}



function TicketsTab({ data, onBought }){
  const [exhibitionId, setExhibitionId] = useState(null)
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  const { exhibitions, prices, discount } = data
  const types = Object.keys(prices)
  const selected = exhibitions.find((item)=>item.ExhibitionID === exhibitionId)

  const priceFor = (type)=>prices[type] * (1 - discount / 100)
  const totalCount = types.reduce((sum, type)=>sum + (counts[type] || 0), 0)
  const totalPrice = types.reduce((sum, type)=>sum + (counts[type] || 0) * priceFor(type), 0)
  const limit = Math.min(MAX_PER_ORDER, selected ? selected.Remaining : 0)

  const setCount = (type, value)=>{
    setCounts((current)=>({ ...current, [type]: value }))
    setError('')
  }

  const chooseExhibition = (id)=>{
    setExhibitionId(id)
    setCounts({})
    setError('')
  }

  const handleBuy = async ()=>{
    setBuying(true)
    setError('')

    try{
      const result = await callApi('/api/customer/tickets', 'POST', {
        ExhibitionID: exhibitionId,
        Tickets: counts,
      })

      setCounts({})
      setExhibitionId(null)
      onBought(`You bought ${result.count} ${result.count === 1 ? 'ticket' : 'tickets'} for ${money(result.total)}.`)
    }
    catch(buyError){
      setError(buyError.message)
    }
    finally{
      setBuying(false)
    }
  }

  if(exhibitions.length === 0){
    return (
      <section className="cp-card">
        <p className="cp-empty">There are no exhibitions open right now. Please check back soon.</p>
      </section>
    )
  }

  return (
    <div className="cp-buy">
      <section className="cp-card">
        <div className="cp-label">Step 1</div>
        <h2>Choose an exhibition</h2>

        <div className="cp-options">
          {exhibitions.map((item)=>{
            const soldOut = item.Remaining === 0

            return (
              <button
                key={item.ExhibitionID}
                type="button"
                className={`cp-option${item.ExhibitionID === exhibitionId ? ' is-selected' : ''}`}
                onClick={()=>chooseExhibition(item.ExhibitionID)}
                disabled={soldOut}
              >
                <span className="cp-option-name">{item.Name}</span>
                {item.Description && <span className="cp-option-text">{item.Description}</span>}
                <span className="cp-option-meta">
                  Until {formatDate(item.EndDate)}
                  {' · '}
                  {soldOut ? 'Sold out' : `${item.Remaining} left`}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="cp-card cp-summary">
        <div className="cp-label">Step 2</div>
        <h2>Tickets</h2>

        {!selected ? (
          <p className="cp-empty">Choose an exhibition first.</p>
        ) : (
          <>
            <ul className="cp-lines">
              {types.map((type)=>(
                <li key={type} className="cp-line">
                  <div>
                    <div className="strong">{type}</div>
                    <div className="cp-price">
                      {money(priceFor(type))}
                      {discount > 0 && <s>{money(prices[type])}</s>}
                    </div>
                  </div>
                  <Stepper
                    label={`${type} tickets`}
                    value={counts[type] || 0}
                    max={(counts[type] || 0) + limit - totalCount}
                    onChange={(value)=>setCount(type, value)}
                  />
                </li>
              ))}
            </ul>

            {discount > 0 && (
              <p className="cp-note">Your {discount}% member discount is included.</p>
            )}

            <div className="cp-total">
              <span>Total</span>
              <strong>{money(totalPrice)}</strong>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button
              type="button"
              className="btn primary cp-wide"
              onClick={handleBuy}
              disabled={totalCount === 0 || buying}
            >
              {buying ? 'Buying...' : `Buy ${totalCount || ''} ${totalCount === 1 ? 'Ticket' : 'Tickets'}`}
            </button>
          </>
        )}
      </section>
    </div>
  )
}



function ShopTab({ items, onBought }){
  const [cart, setCart] = useState({})
  const [payment, setPayment] = useState('')
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  const lines = items.filter((item)=>cart[item.ItemID] > 0)
  const total = lines.reduce((sum, item)=>sum + item.Price * cart[item.ItemID], 0)

  const setQuantity = (itemId, value)=>{
    setCart((current)=>({ ...current, [itemId]: value }))
    setError('')
  }

  const handleOrder = async ()=>{
    if(!payment){
      setError('Please choose a payment method.')
      return
    }

    setBuying(true)
    setError('')

    try{
      const result = await callApi('/api/customer/shop/orders', 'POST', {
        PaymentMethod: payment,
        Items: lines.map((item)=>({ ItemID: item.ItemID, Quantity: cart[item.ItemID] })),
      })

      setCart({})
      setPayment('')
      onBought(`Thank you! Your order of ${money(result.total)} has been placed.`)
    }
    catch(orderError){
      setError(orderError.message)
    }
    finally{
      setBuying(false)
    }
  }

  if(items.length === 0){
    return (
      <section className="cp-card">
        <p className="cp-empty">The gift shop has no items right now.</p>
      </section>
    )
  }

  return (
    <div className="cp-buy">
      <div className="cp-items">
        {items.map((item)=>{
          const inCart = cart[item.ItemID] || 0
          const soldOut = item.Stock === 0

          return (
            <section key={item.ItemID} className={`cp-card cp-item${soldOut ? ' is-out' : ''}`}>
              <div className="cp-label">{item.Category}</div>
              <h3>{item.ItemName}</h3>
              <div className="cp-item-price">{money(item.Price)}</div>
              <div className="cp-item-stock">
                {soldOut ? 'Out of stock' : item.Stock <= 5 ? `Only ${item.Stock} left` : 'In stock'}
              </div>

              {!soldOut && (
                inCart === 0 ? (
                  <button
                    type="button"
                    className="btn secondary cp-wide"
                    onClick={()=>setQuantity(item.ItemID, 1)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <Stepper
                    label={item.ItemName}
                    value={inCart}
                    max={Math.min(item.Stock, MAX_PER_ORDER)}
                    onChange={(value)=>setQuantity(item.ItemID, value)}
                  />
                )
              )}
            </section>
          )
        })}
      </div>

      <section className="cp-card cp-summary">
        <h2>Your Cart</h2>

        {lines.length === 0 ? (
          <p className="cp-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cp-lines">
              {lines.map((item)=>(
                <li key={item.ItemID} className="cp-line">
                  <span>{item.ItemName} × {cart[item.ItemID]}</span>
                  <span>{money(item.Price * cart[item.ItemID])}</span>
                </li>
              ))}
            </ul>

            <div className="cp-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>

            <div className="form-group">
              <label htmlFor="cp-payment">Payment</label>
              <select
                id="cp-payment"
                value={payment}
                onChange={(e)=>{
                  setPayment(e.target.value)
                  setError('')
                }}
              >
                <option value="">Choose a payment method</option>
                {ONLINE_PAYMENTS.map((method)=>(
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button
              type="button"
              className="btn primary cp-wide"
              onClick={handleOrder}
              disabled={buying}
            >
              {buying ? 'Placing Order...' : 'Place Order'}
            </button>
          </>
        )}
      </section>
    </div>
  )
}



function CustomerPage(){
  const { user } = useRole()
  const [tab, setTab] = useState('membership')
  const [account, setAccount] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [shopItems, setShopItems] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')

  const loadAll = useCallback(async()=>{
    try{
      const [accountData, exhibitionData, items] = await Promise.all([
        callApi('/api/customer/account', 'GET'),
        callApi('/api/customer/exhibitions', 'GET'),
        callApi('/api/customer/shop', 'GET'),
      ])

      setAccount(accountData)
      setTicketData(exhibitionData)
      setShopItems(items)
      setLoadError('')
    }
    catch(error){
      setLoadError(error.message)
    }
  }, [])

  useEffect(()=>{
    loadAll()
  }, [loadAll])

  const switchTab = (id)=>{
    setTab(id)
    setMessage('')
  }

  const handleBought = (text)=>{
    setMessage(text)
    loadAll()
  }

  const firstName = (user.name || '').split(' ')[0]

  return (
    <div className="cp-page">
      <header className="cp-header">
        <h1>{firstName ? `Welcome back, ${firstName}` : 'My Account'}</h1>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((item)=>(
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tab${tab === item.id ? ' active' : ''}`}
            onClick={()=>switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <p className="cp-success" role="status">{message}</p>}

      {loadError && (
        <p className="form-error" role="alert">Could not load your account: {loadError}</p>
      )}

      {!loadError && account === null && <p className="cp-empty">Loading...</p>}

      {account && tab === 'membership' && <MembershipTab account={account} />}
      {ticketData && tab === 'tickets' && <TicketsTab data={ticketData} onBought={handleBought} />}
      {shopItems && tab === 'shop' && <ShopTab items={shopItems} onBought={handleBought} />}
    </div>
  )
}

export default CustomerPage