import { useEffect, useState } from 'react'
import {
  actualizarIngrediente,
  consultarIngredientes,
  crearIngrediente,
  eliminarIngrediente,
} from '../services/ingredientesService'

const formularioInicial = {
  nombre: '',
  precio: '',
  calorias: '',
  inventario: '',
  es_vegetariano: false,
  es_sano: false,
  tipo: '',
  sabor: '',
}

const camposTexto = [
  { id: 'nombre', label: 'Nombre' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'sabor', label: 'Sabor' },
]

const camposNumero = [
  { id: 'precio', label: 'Precio' },
  { id: 'calorias', label: 'Calorias' },
  { id: 'inventario', label: 'Inventario' },
]

const camposCheckbox = [
  { id: 'es_vegetariano', label: 'Vegetariano' },
  { id: 'es_sano', label: 'Sano' },
]

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

function Ingredientes() {
  const [ingredientes, setIngredientes] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [ingredienteEditando, setIngredienteEditando] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  function guardarConsulta(data, queryError) {
    if (queryError) {
      setError(queryError.message)
      setIngredientes([])
    } else {
      setIngredientes(data || [])
    }
  }

  async function cargarIngredientes() {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await consultarIngredientes()
    guardarConsulta(data, queryError)
    setLoading(false)
  }

  useEffect(() => {
    async function cargarIngredientesIniciales() {
      const { data, error: queryError } = await consultarIngredientes()
      guardarConsulta(data, queryError)
      setLoading(false)
    }

    cargarIngredientesIniciales()
  }, [])

  function cambiarCampo(event) {
    const { checked, name, type, value } = event.target

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial)
    setIngredienteEditando(null)
  }

  function prepararIngrediente() {
    return {
      nombre: formulario.nombre,
      precio: Number(formulario.precio),
      calorias: Number(formulario.calorias),
      inventario: Number(formulario.inventario),
      es_vegetariano: formulario.es_vegetariano,
      es_sano: formulario.es_sano,
      tipo: formulario.tipo,
      sabor: formulario.sabor,
    }
  }

  async function guardarIngrediente(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')

    const datosIngrediente = prepararIngrediente()
    const { error: mutationError } = ingredienteEditando
      ? await actualizarIngrediente(ingredienteEditando.id, datosIngrediente)
      : await crearIngrediente(datosIngrediente)

    if (mutationError) {
      setError(mutationError.message)
    } else {
      limpiarFormulario()
      await cargarIngredientes()
    }

    setGuardando(false)
  }

  function editarIngrediente(ingrediente) {
    setIngredienteEditando(ingrediente)
    setFormulario({
      nombre: ingrediente.nombre || '',
      precio: ingrediente.precio || '',
      calorias: ingrediente.calorias || '',
      inventario: ingrediente.inventario || '',
      es_vegetariano: Boolean(ingrediente.es_vegetariano),
      es_sano: Boolean(ingrediente.es_sano),
      tipo: ingrediente.tipo || '',
      sabor: ingrediente.sabor || '',
    })
  }

  async function borrarIngrediente(id) {
    const confirmar = confirm('Deseas eliminar este ingrediente?')
    if (!confirmar) return

    setError('')
    const { error: deleteError } = await eliminarIngrediente(id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      await cargarIngredientes()
    }
  }

  if (loading) {
    return <p className="alert alert-info">Cargando ingredientes...</p>
  }

  if (error) {
    return <p className="alert alert-danger">Error de conexion o consulta: {error}</p>
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Ingredientes</h1>
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={cargarIngredientes}>
            Recargar
          </button>
        </div>

        <form className="row g-3 mb-4" onSubmit={guardarIngrediente}>
          {camposTexto.map((campo) => (
            <div className="col-md-4" key={campo.id}>
              <label className="form-label" htmlFor={campo.id}>
                {campo.label}
              </label>
              <input
                className="form-control"
                id={campo.id}
                name={campo.id}
                value={formulario[campo.id]}
                onChange={cambiarCampo}
                required
              />
            </div>
          ))}

          {camposNumero.map((campo) => (
            <div className="col-md-4" key={campo.id}>
              <label className="form-label" htmlFor={campo.id}>
                {campo.label}
              </label>
              <input
                className="form-control"
                id={campo.id}
                min="0"
                name={campo.id}
                type="number"
                value={formulario[campo.id]}
                onChange={cambiarCampo}
                required
              />
            </div>
          ))}

          {camposCheckbox.map((campo) => (
            <div className="col-md-4" key={campo.id}>
              <div className="form-check">
                <input
                  checked={formulario[campo.id]}
                  className="form-check-input"
                  id={campo.id}
                  name={campo.id}
                  type="checkbox"
                  onChange={cambiarCampo}
                />
                <label className="form-check-label" htmlFor={campo.id}>
                  {campo.label}
                </label>
              </div>
            </div>
          ))}

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={guardando}>
              {ingredienteEditando ? 'Guardar cambios' : 'Crear ingrediente'}
            </button>
            {ingredienteEditando && (
              <button className="btn btn-outline-secondary" type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {ingredientes.length === 0 && (
          <p className="alert alert-warning">No hay ingredientes para mostrar.</p>
        )}

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-primary">
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Sabor</th>
                <th>Precio</th>
                <th>Calorias</th>
                <th>Inventario</th>
                <th>Vegetariano</th>
                <th>Sano</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ingredientes.map((ingrediente) => (
                <tr key={ingrediente.id}>
                  <td>{ingrediente.nombre}</td>
                  <td>{ingrediente.tipo}</td>
                  <td>{ingrediente.sabor}</td>
                  <td>{formatoMoneda.format(ingrediente.precio || 0)}</td>
                  <td>{ingrediente.calorias}</td>
                  <td>{ingrediente.inventario}</td>
                  <td>{ingrediente.es_vegetariano ? 'Si' : 'No'}</td>
                  <td>{ingrediente.es_sano ? 'Si' : 'No'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => editarIngrediente(ingrediente)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => borrarIngrediente(ingrediente.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Ingredientes
