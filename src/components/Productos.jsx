import { useEffect, useState } from 'react'
import {
  agregarUnidadesDisponiblesProducto,
  consultarProductosConIngredientes,
} from '../services/productosService'
import { consultarIngredientes } from '../services/ingredientesService'
import {
  consultarIngredientesPorProducto,
  reemplazarIngredientesDeProducto,
} from '../services/productoIngredientesService'
import { venderProducto } from '../services/ventasService'

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

const posicionesIngredientes = [0, 1, 2]

function Productos({ perfil, user }) {
  const [productos, setProductos] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState(['', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardandoRelacion, setGuardandoRelacion] = useState(false)
  const [vendiendoId, setVendiendoId] = useState(null)
  const [agregandoInventarioId, setAgregandoInventarioId] = useState(null)
  const [unidadesPorProducto, setUnidadesPorProducto] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const rol = perfil?.rol?.toLowerCase()
  const esAdministrador = user && ['administrador', 'admin'].includes(rol)
  const esEmpleado = user && rol === 'empleado'
  const esCliente = user && rol === 'cliente'
  const permisos = {
    asignarIngredientes: esAdministrador || esEmpleado,
    verIngredientes: esAdministrador || esEmpleado,
    verCosto: esAdministrador || esEmpleado,
    verCalorias: esAdministrador || esEmpleado || esCliente,
    verRentabilidad: esAdministrador,
    verInventario: Boolean(user),
    agregarInventario: esAdministrador || esEmpleado,
    vender: user && ['cliente', 'empleado', 'administrador', 'admin'].includes(rol),
  }

  function guardarProductos(data, queryError) {
    if (queryError) {
      setError(queryError.message)
      setProductos([])
    } else {
      setProductos(data || [])
    }
  }

  async function cargarProductos() {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await consultarProductosConIngredientes()
    guardarProductos(data, queryError)
    setLoading(false)
  }

  useEffect(() => {
    async function cargarDatosIniciales() {
      const productosResponse = await consultarProductosConIngredientes()
      guardarProductos(productosResponse.data, productosResponse.error)

      if (permisos.asignarIngredientes) {
        const ingredientesResponse = await consultarIngredientes()

        if (ingredientesResponse.error) {
          setError(ingredientesResponse.error.message)
          setIngredientes([])
        } else {
          setIngredientes(ingredientesResponse.data || [])
        }
      }

      setLoading(false)
    }

    cargarDatosIniciales()
  }, [permisos.asignarIngredientes])

  async function cambiarProductoSeleccionado(event) {
    const productoId = event.target.value
    setProductoSeleccionado(productoId)
    setMensaje('')
    setIngredientesSeleccionados(['', '', ''])

    if (!productoId) return

    const { data, error: queryError } = await consultarIngredientesPorProducto(productoId)

    if (queryError) {
      setError(queryError.message)
      return
    }

    const idsRelacionados = (data || []).map((item) => String(item.ingrediente_id))
    setIngredientesSeleccionados([
      idsRelacionados[0] || '',
      idsRelacionados[1] || '',
      idsRelacionados[2] || '',
    ])
  }

  function cambiarIngredienteSeleccionado(posicion, value) {
    const nuevaSeleccion = [...ingredientesSeleccionados]
    nuevaSeleccion[posicion] = value
    setIngredientesSeleccionados(nuevaSeleccion)
  }

  async function guardarRelacionProductoIngredientes(event) {
    event.preventDefault()
    setError('')
    setMensaje('')

    const ids = ingredientesSeleccionados.map((id) => Number(id))
    const idsUnicos = new Set(ids)

    if (!productoSeleccionado || ids.some((id) => !id)) {
      setError('Selecciona un producto y 3 ingredientes.')
      return
    }

    if (idsUnicos.size !== 3) {
      setError('Los 3 ingredientes deben ser diferentes.')
      return
    }

    setGuardandoRelacion(true)

    const { error: mutationError } = await reemplazarIngredientesDeProducto(
      Number(productoSeleccionado),
      ids,
    )

    if (mutationError) {
      setError(mutationError.message)
    } else {
      setMensaje('Ingredientes asignados correctamente al producto.')
      await cargarProductos()
    }

    setGuardandoRelacion(false)
  }

  async function vender(producto) {
    setError('')
    setMensaje('')
    setVendiendoId(producto.id)

    const { error: ventaError } = await venderProducto(producto, user)

    if (ventaError) {
      setError(ventaError.message)
    } else {
      setMensaje(`Venta registrada para ${producto.nombre}.`)
      await cargarProductos()
    }

    setVendiendoId(null)
  }

  function cambiarUnidadesProducto(productoId, value) {
    setUnidadesPorProducto((unidadesActuales) => ({
      ...unidadesActuales,
      [productoId]: value,
    }))
  }

  async function agregarUnidades(producto) {
    setError('')
    setMensaje('')

    const unidades = Number(unidadesPorProducto[producto.id] || 0)

    setAgregandoInventarioId(producto.id)

    const { error: inventarioError } = await agregarUnidadesDisponiblesProducto(
      producto,
      unidades,
    )

    if (inventarioError) {
      setError(inventarioError.message)
    } else {
      setMensaje(`Se agregaron ${unidades} unidades disponibles a ${producto.nombre}.`)
      setUnidadesPorProducto((unidadesActuales) => ({
        ...unidadesActuales,
        [producto.id]: '',
      }))
      await cargarProductos()
    }

    setAgregandoInventarioId(null)
  }

  if (loading) {
    return <p className="alert alert-info">Cargando productos...</p>
  }

  if (error) {
    return <p className="alert alert-danger">Error de conexion o consulta: {error}</p>
  }

  if (productos.length === 0) {
    return <p className="alert alert-warning">No hay productos para mostrar.</p>
  }

  const tiposProductos = [...new Set(productos.map((producto) => producto.tipo).filter(Boolean))]
  const filtrosProductos = ['todos', ...tiposProductos]
  const productosFiltrados =
    filtroTipo === 'todos'
      ? productos
      : productos.filter((producto) => producto.tipo === filtroTipo)

  function obtenerTextoInventario(producto) {
    return producto.ingredientes.length === 3
      ? `${producto.inventarioDisponible} unidades`
      : 'Sin 3 ingredientes'
  }

  function obtenerTextoIngredientes(producto) {
    return producto.ingredientes.length > 0
      ? producto.ingredientes.map((ingrediente) => ingrediente.nombre).join(', ')
      : 'Sin ingredientes'
  }

  function renderProducto(producto) {
    return (
      <article className="producto-card" key={producto.id}>
        <div className="producto-info">
          <div className="producto-head">
            <div className="producto-imagen" aria-hidden="true">
              <span className="producto-bola bola-uno" />
              <span className="producto-bola bola-dos" />
              <span className="producto-vaso" />
            </div>

            <div>
              <span className="producto-tipo">{producto.tipo || 'Producto'}</span>
              <h2>{producto.nombre}</h2>
            </div>
          </div>

          <p className="producto-precio">{formatoMoneda.format(producto.precio_publico || 0)}</p>

          <div className="producto-detalles">
            {permisos.verInventario && <span>Inventario: {obtenerTextoInventario(producto)}</span>}
            {permisos.verCalorias && <span>Calorias: {producto.calorias}</span>}
            {permisos.verCosto && <span>Costo: {formatoMoneda.format(producto.costo || 0)}</span>}
            {permisos.verRentabilidad && (
              <span>Rentabilidad: {formatoMoneda.format(producto.rentabilidad || 0)}</span>
            )}
          </div>

          {permisos.verIngredientes && (
            <p className="producto-ingredientes">{obtenerTextoIngredientes(producto)}</p>
          )}

          {permisos.agregarInventario && (
            <div className="producto-acciones">
              <input
                className="form-control form-control-sm"
                min="1"
                placeholder="Unidades"
                type="number"
                value={unidadesPorProducto[producto.id] || ''}
                onChange={(event) => cambiarUnidadesProducto(producto.id, event.target.value)}
              />
              <button
                className="btn btn-outline-success btn-sm"
                type="button"
                onClick={() => agregarUnidades(producto)}
                disabled={agregandoInventarioId === producto.id}
              >
                {agregandoInventarioId === producto.id ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          )}

          {permisos.vender && (
            <button
              className="btn btn-success btn-sm w-100"
              type="button"
              onClick={() => vender(producto)}
              disabled={vendiendoId === producto.id}
            >
              {vendiendoId === producto.id ? 'Vendiendo...' : 'Vender'}
            </button>
          )}
        </div>
      </article>
    )
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Productos</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" type="button" onClick={cargarProductos}>
              Recargar
            </button>
          </div>
        </div>

        {permisos.asignarIngredientes && (
          <form className="border rounded p-3 mb-4" onSubmit={guardarRelacionProductoIngredientes}>
            <h2 className="h5 mb-3">Asignar 3 ingredientes a un producto</h2>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="producto">
                  Producto
                </label>
                <select
                  className="form-select"
                  id="producto"
                  value={productoSeleccionado}
                  onChange={cambiarProductoSeleccionado}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre || `Producto ${producto.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {posicionesIngredientes.map((posicion) => (
                <div className="col-md-4" key={posicion}>
                  <label className="form-label" htmlFor={`ingrediente-${posicion}`}>
                    Ingrediente {posicion + 1}
                  </label>
                  <select
                    className="form-select"
                    id={`ingrediente-${posicion}`}
                    value={ingredientesSeleccionados[posicion]}
                    onChange={(event) => cambiarIngredienteSeleccionado(posicion, event.target.value)}
                  >
                    <option value="">Selecciona ingrediente</option>
                    {ingredientes.map((ingrediente) => (
                      <option key={ingrediente.id} value={ingrediente.id}>
                        {ingrediente.nombre} ({ingrediente.tipo})
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="col-12">
                <button className="btn btn-success" type="submit" disabled={guardandoRelacion}>
                  {guardandoRelacion ? 'Guardando...' : 'Guardar ingredientes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {mensaje && <p className="alert alert-success">{mensaje}</p>}
        <div className="productos-layout">
          <aside className="productos-sidebar">
            <h2 className="h5">Filtros</h2>
            {filtrosProductos.map((tipo) => (
              <button
                className={filtroTipo === tipo ? 'active' : ''}
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
              >
                {tipo === 'todos' ? 'Todos' : tipo}
              </button>
            ))}
          </aside>

          <div className="productos-catalogo">
            {productosFiltrados.map(renderProducto)}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Productos
