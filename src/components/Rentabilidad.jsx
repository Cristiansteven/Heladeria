import { useCallback, useEffect, useState } from 'react'
import { consultarProductosConIngredientes } from '../services/productosService'

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

function Rentabilidad() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const ordenarPorRentabilidad = useCallback((data) => {
    return (data || [])
      .filter((producto) => producto.ingredientes.length === 3)
      .sort((a, b) => Number(b.rentabilidad || 0) - Number(a.rentabilidad || 0))
  }, [])

  const guardarProductos = useCallback((data, queryError) => {
    if (queryError) {
      setError(queryError.message)
      setProductos([])
    } else {
      setProductos(ordenarPorRentabilidad(data))
    }
  }, [ordenarPorRentabilidad])

  async function cargarProductosRentables() {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await consultarProductosConIngredientes()
    guardarProductos(data, queryError)
    setLoading(false)
  }

  useEffect(() => {
    async function cargarDatosIniciales() {
      const { data, error: queryError } = await consultarProductosConIngredientes()
      guardarProductos(data, queryError)
      setLoading(false)
    }

    cargarDatosIniciales()
  }, [guardarProductos])

  if (loading) {
    return <p className="alert alert-info">Cargando rentabilidad...</p>
  }

  if (error) {
    return <p className="alert alert-danger">Error de conexion o consulta: {error}</p>
  }

  const productoMasRentable = productos[0]

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Productos mas rentables</h1>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={cargarProductosRentables}
          >
            Recargar
          </button>
        </div>

        {productoMasRentable && (
          <div className="alert alert-success">
            <strong>Producto mas rentable:</strong> {productoMasRentable.nombre}.{' '}
            <strong>Rentabilidad:</strong>{' '}
            {formatoMoneda.format(productoMasRentable.rentabilidad || 0)}
          </div>
        )}

        {productos.length === 0 ? (
          <p className="alert alert-warning mb-0">
            No hay productos con 3 ingredientes asignados para calcular rentabilidad.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Precio publico</th>
                  <th>Costo ingredientes</th>
                  <th>Rentabilidad</th>
                  <th>Ingredientes</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.tipo}</td>
                    <td>{formatoMoneda.format(producto.precio_publico || 0)}</td>
                    <td>{formatoMoneda.format(producto.costo || 0)}</td>
                    <td className="fw-semibold">
                      {formatoMoneda.format(producto.rentabilidad || 0)}
                    </td>
                    <td>
                      {producto.ingredientes.map((ingrediente) => ingrediente.nombre).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Rentabilidad
