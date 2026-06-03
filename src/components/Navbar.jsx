import { NavLink } from 'react-router-dom'

function Navbar({ onLogout, perfil, user }) {
  const getLinkClass = ({ isActive }) =>
    isActive ? 'btn btn-light btn-sm' : 'btn btn-outline-light btn-sm'
  const puedeVerIngredientes = user && perfil?.rol !== 'cliente'

  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container">
        <span className="navbar-brand mb-0 h1">Heladeria</span>

        <div className="d-flex gap-2">
          <span className="text-white-50 small d-flex align-items-center">
            {perfil?.nombre} - {perfil?.rol}
          </span>
          <NavLink className={getLinkClass} to="/">
            Inicio
          </NavLink>
          {puedeVerIngredientes && (
            <NavLink className={getLinkClass} to="/ingredientes">
              Ingredientes
            </NavLink>
          )}
          <NavLink className={getLinkClass} to="/productos">
            Productos
          </NavLink>
          {user ? (
            <button className="btn btn-outline-light btn-sm" type="button" onClick={onLogout}>
              Cerrar sesion
            </button>
          ) : (
            <NavLink className={getLinkClass} to="/login">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
