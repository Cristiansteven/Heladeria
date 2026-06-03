import { useState } from 'react'
import {
  consultarPerfilUsuario,
  consultarUsuarioActual,
  iniciarSesionConEmail,
} from '../services/authService'

function Login({ onAuthChange }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function iniciarSesion(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setUser(null)
    setPerfil(null)

    const { error: loginError } = await iniciarSesionConEmail(email, password)

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await consultarUsuarioActual()

    const userId = user.id
    const { data: perfilData, error: perfilError } = await consultarPerfilUsuario(userId)

    if (perfilError) {
      setError(perfilError.message)
      setLoading(false)
      return
    }

    setUser(user)
    setPerfil(perfilData)
    onAuthChange()
    setLoading(false)
  }

  return (
    <section className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-3">Login</h1>

            <form onSubmit={iniciarSesion}>
              <label className="form-label" htmlFor="email">
                Correo
              </label>
              <input
                className="form-control mb-3"
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label className="form-label" htmlFor="password">
                Contrasena
              </label>
              <input
                className="form-control mb-3"
                id="password"
                type="password"
                placeholder="Ingresa tu contrasena"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            {error && <p className="alert alert-danger mt-3 mb-0">Error: {error}</p>}

            {user && (
              <div className="alert alert-success mt-3 mb-0">
                <p className="fw-semibold mb-1">Usuario autenticado</p>
                <p className="mb-1">ID: {user.id}</p>
                <p className="mb-1">Email: {user.email}</p>
                <p className="mb-1">Nombre: {perfil?.nombre}</p>
                <p className="mb-0">Rol: {perfil?.rol}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
