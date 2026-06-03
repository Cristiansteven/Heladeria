import { useEffect, useState } from 'react'
import { consultarVentasDelDia } from '../services/ventasService'

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

function VentasDia() {
  const [ventasDia, setVentasDia] = useState({ cantidad: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargarVentasDelDia() {
    setLoading(true)
    setError('')

    const { data, error: ventasError } = await consultarVentasDelDia()

    if (ventasError) {
      setError(ventasError.message)
      setVentasDia({ cantidad: 0, total: 0 })
    } else {
      setVentasDia(data || { cantidad: 0, total: 0 })
    }

    setLoading(false)
  }

  useEffect(() => {
    let componenteActivo = true

    async function cargarVentasIniciales() {
      const { data, error: ventasError } = await consultarVentasDelDia()

      if (!componenteActivo) return

      if (ventasError) {
        setError(ventasError.message)
        setVentasDia({ cantidad: 0, total: 0 })
      } else {
        setVentasDia(data || { cantidad: 0, total: 0 })
      }

      setLoading(false)
    }

    cargarVentasIniciales()

    return () => {
      componenteActivo = false
    }
  }, [])

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Ventas del dia</h1>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={cargarVentasDelDia}
            disabled={loading}
          >
            {loading ? 'Consultando...' : 'Recargar'}
          </button>
        </div>

        {error && <p className="alert alert-danger">Error de conexion o consulta: {error}</p>}

        {!error && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-4 bg-light">
                <p className="text-muted mb-1">Productos vendidos hoy</p>
                <p className="display-6 fw-semibold mb-0">{ventasDia.cantidad}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-4 bg-light">
                <p className="text-muted mb-1">Total vendido hoy</p>
                <p className="display-6 fw-semibold mb-0">
                  {formatoMoneda.format(ventasDia.total)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default VentasDia
