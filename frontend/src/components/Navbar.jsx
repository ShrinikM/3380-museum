import{ BellIcon } from './Icons'

function Navbar(){
  return(
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">M</span>
        <span className="brand-name">MFA Houston</span>
        <span className="brand-sub">Museum Database</span>
      </div>

      <div className="navbar-right">
        <button className="icon-btn">
          <BellIcon size={15} />
        </button>

        <div className="user">
          <span className="avatar">VK</span>
          <div className="user-info">
            <div className="user-name">Valeriia Krokhotina</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar