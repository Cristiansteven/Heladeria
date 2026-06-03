import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx'
import Ingredientes from './components/Ingredientes.jsx'
import Productos from './components/Productos.jsx'
import Login from './components/Login.jsx'
import VentasDia from './components/VentasDia.jsx'
import Rentabilidad from './components/Rentabilidad.jsx'
import {
  cerrarSesionActual,
  consultarPerfilUsuario,
  consultarSesionActual,
} from './services/authService.js'

function AuthGuard({ allowedRoles, perfil, user, children }) {
  const rol = perfil?.rol?.toLowerCase()

  if (!user || !allowedRoles.includes(rol)) {
    return <Navigate to="/productos" replace />
  }

  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState({ nombre: 'Invitado', rol: 'Publico' })

  async function cargarSesion() {
    const {
      data: { session },
    } = await consultarSesionActual()

    if (!session?.user) {
      setUser(null)
      setPerfil({ nombre: 'Invitado', rol: 'Publico' })
      return
    }

    const { data: perfilData } = await consultarPerfilUsuario(session.user.id)

    setUser(session.user)
    setPerfil(perfilData || { nombre: session.user.email, rol: 'Usuario' })
  }

  async function cerrarSesion() {
    await cerrarSesionActual()
    setUser(null)
    setPerfil({ nombre: 'Invitado', rol: 'Publico' })
  }

  useEffect(() => {
    async function cargarSesionInicial() {
      const {
        data: { session },
      } = await consultarSesionActual()

      if (!session?.user) {
        setUser(null)
        setPerfil({ nombre: 'Invitado', rol: 'Publico' })
        return
      }

      const { data: perfilData } = await consultarPerfilUsuario(session.user.id)

      setUser(session.user)
      setPerfil(perfilData || { nombre: session.user.email, rol: 'Usuario' })
    }

    cargarSesionInicial()
  }, [])

  return (
    <div className="app-shell bg-light min-vh-100">
      <Navbar onLogout={cerrarSesion} perfil={perfil} user={user} />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/ingredientes"
            element={
              <AuthGuard
                allowedRoles={['empleado', 'administrador', 'admin']}
                perfil={perfil}
                user={user}
              >
                <Ingredientes />
              </AuthGuard>
            }
          />
          <Route path="/productos" element={<Productos perfil={perfil} user={user} />} />
          <Route
            path="/ventas-dia"
            element={
              <AuthGuard
                allowedRoles={['cliente', 'administrador', 'admin']}
                perfil={perfil}
                user={user}
              >
                <VentasDia />
              </AuthGuard>
            }
          />
          <Route
            path="/rentabilidad"
            element={
              <AuthGuard
                allowedRoles={['administrador', 'admin']}
                perfil={perfil}
                user={user}
              >
                <Rentabilidad />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<Login onAuthChange={cargarSesion} />} />
        </Routes>
      </main>
    </div>
  )
}
