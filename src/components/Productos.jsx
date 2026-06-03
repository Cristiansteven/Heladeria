import { useEffect, useState } from 'react'
import { consultarProductos } from '../services/productosService'

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

function Productos() {
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function cargarProductos() {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await consultarProductos()

    if (queryError) {
      setError(queryError.message)
      setProductos([])
    } else {
      setProductos(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    async function cargarProductosIniciales() {
      const { data, error: queryError } = await consultarProductos()

      if (queryError) {
        setError(queryError.message)
        setProductos([])
      } else {
        setProductos(data || [])
      }

      setLoading(false)
    }

    cargarProductosIniciales()
  }, [])

  if (loading) {
    return <p className="alert alert-info">Cargando productos...</p>
  }

  if (error) {
    return <p className="alert alert-danger">Error de conexion o consulta: {error}</p>
  }

  if (productos.length === 0) {
    return <p className="alert alert-warning">No hay productos para mostrar.</p>
  }

  const columnas = Object.keys(productos[0])

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Productos</h1>
          <button className="btn btn-primary btn-sm" type="button" onClick={cargarProductos}>
            Recargar
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-primary">
              <tr>
                {columnas.map((columna) => (
                  <th key={columna}>{columna}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {productos.map((producto, index) => (
                <tr key={index}>
                  {columnas.map((columna) => (
                    <td key={columna}>
                      {columna === 'precio_publico'
                        ? formatoMoneda.format(producto[columna] || 0)
                        : String(producto[columna] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Productos
