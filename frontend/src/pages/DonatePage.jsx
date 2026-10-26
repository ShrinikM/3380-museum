import { useState } from 'react'
import { callApi } from '../api'
import './DonatePage.css'

const IMAGE = `${import.meta.env.BASE_URL}images/terrace.jpeg`
const AMOUNTS = [500, 250, 100, 50, 25, 10]
const MIN_AMOUNT = 10
const PAYMENTS = ['Credit Card', 'Debit Card', 'Bank Transfer']

const emptyForm = {
  FirstName: '',
  LastName: '',
  PaymentMethod: '',
}

function money(value){
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function DonatePage(){
  const [preset, setPreset] = useState(null)
  const [custom, setCustom] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(null)

  const amount = custom !== '' ? Number(custom) : preset

  const handleChange = (e)=>{
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const choosePreset = (value)=>{
    setPreset(value)
    setCustom('')
    setError('')
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()

    if(!amount || amount <= 0){
      setError('Please choose or enter an amount.')
      return
    }

    if(amount < MIN_AMOUNT){
      setError('The minimum donation is $10.')
      return
    }

    if(!form.FirstName.trim() || !form.LastName.trim()){
      setError('Please enter your first and last name.')
      return
    }

    if(!form.PaymentMethod){
      setError('Please choose a payment method.')
      return
    }

    setSending(true)

    try{
      const donation = await callApi('/api/public/donations', 'POST', {
        ...form,
        AmountDonated: amount,
      })

      setDone(donation)
      setForm(emptyForm)
      setPreset(null)
      setCustom('')
    }
    catch(sendError){
      setError(sendError.message)
    }
    finally{
      setSending(false)
    }
  }

  return (
    <div className="dn-page">
      <section
        className="dn-hero"
        style={{ backgroundImage: `linear-gradient(rgba(20, 18, 24, 0.45), rgba(20, 18, 24, 0.65)), url(${IMAGE})` }}
      >
        <h1>Support CoogMuseum</h1>
        <p>You can help us care for the collection and bring new exhibitions to Houston.</p>
      </section>

      <section className="dn-card">
        {done ? (
          <div className="dn-thanks">
            <div className="dn-thanks-amount">{money(done.AmountDonated)}</div>
            <h2>Thank you, {done.FirstName}!</h2>
            <p>Your donation has been received.</p>
            <button type="button" className="btn secondary" onClick={()=>setDone(null)}>
              Make another donation
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="dn-step">
              <span className="dn-step-num">1</span>
              <h2>Choose an amount</h2>
            </div>

            <div className="dn-amounts">
              {AMOUNTS.map((value)=>(
                <button
                  key={value}
                  type="button"
                  className={`dn-amount${preset === value && custom === '' ? ' is-selected' : ''}`}
                  onClick={()=>choosePreset(value)}
                >
                  ${value}
                </button>
              ))}
            </div>

            <div className="dn-custom">
              <span>$</span>
              <input
                type="number"
                min="10"
                step="0.01"
                placeholder="Other amount (min $10)"
                aria-label="Other amount"
                value={custom}
                onChange={(e)=>{
                  setCustom(e.target.value)
                  setError('')
                }}
              />
            </div>

            <div className="dn-step">
              <span className="dn-step-num">2</span>
              <h2>Your details</h2>
            </div>

            <div className="dn-row">
              <div className="form-group">
                <label htmlFor="dn-first">First name</label>
                <input id="dn-first" name="FirstName" value={form.FirstName} onChange={handleChange} autoComplete="given-name" />
              </div>

              <div className="form-group">
                <label htmlFor="dn-last">Last name</label>
                <input id="dn-last" name="LastName" value={form.LastName} onChange={handleChange} autoComplete="family-name" />
              </div>

              <div className="form-group">
                <label htmlFor="dn-payment">Payment method</label>
                <select id="dn-payment" name="PaymentMethod" value={form.PaymentMethod} onChange={handleChange}>
                  <option value="">Choose one</option>
                  {PAYMENTS.map((method)=>(
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="dn-footer">
              <div className="dn-total">
                <span>Amount</span>
                <strong>{amount > 0 ? money(amount) : '$0.00'}</strong>
              </div>

              <button type="submit" className="btn primary dn-submit" disabled={sending}>
                {sending ? 'Sending...' : 'Donate'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default DonatePage