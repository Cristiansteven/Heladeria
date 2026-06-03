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

function Ingredientes() {
  const [ingredientes, setIngredientes] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [ingredienteEditando, setIngredienteEditando] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  async function cargarIngredientes() {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await consultarIngredientes()

    if (queryError) {
      setError(queryError.message)
      setIngredientes([])
    } else {
      setIngredientes(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    async function cargarIngredientesIniciales() {
      const { data, error: queryError } = await consultarIngredientes()

      if (queryError) {
        setError(queryError.message)
        setIngredientes([])
      } else {
        setIngredientes(data || [])
      }

      setLoading(false)
    }

    cargarIngredientesIniciales()
  }, [])

  function cambiarCampo(event) {
    const { checked, name, type, value } = event.target

    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value,
    })
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
          <div className="col-md-4">
            <label className="form-label" htmlFor="nombre">
              Nombre
            </label>
            <input
              className="form-control"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="tipo">
              Tipo
            </label>
            <input
              className="form-control"
              id="tipo"
              name="tipo"
              value={formulario.tipo}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="sabor">
              Sabor
            </label>
            <input
              className="form-control"
              id="sabor"
              name="sabor"
              value={formulario.sabor}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="precio">
              Precio
            </label>
            <input
              className="form-control"
              id="precio"
              min="0"
              name="precio"
              type="number"
              value={formulario.precio}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="calorias">
              Calorias
            </label>
            <input
              className="form-control"
              id="calorias"
              min="0"
              name="calorias"
              type="number"
              value={formulario.calorias}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="inventario">
              Inventario
            </label>
            <input
              className="form-control"
              id="inventario"
              min="0"
              name="inventario"
              type="number"
              value={formulario.inventario}
              onChange={cambiarCampo}
              required
            />
          </div>

          <div className="col-md-4">
            <div className="form-check">
              <input
                checked={formulario.es_vegetariano}
                className="form-check-input"
                id="es_vegetariano"
                name="es_vegetariano"
                type="checkbox"
                onChange={cambiarCampo}
              />
              <label className="form-check-label" htmlFor="es_vegetariano">
                Vegetariano
              </label>
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-check">
              <input
                checked={formulario.es_sano}
                className="form-check-input"
                id="es_sano"
                name="es_sano"
                type="checkbox"
                onChange={cambiarCampo}
              />
              <label className="form-check-label" htmlFor="es_sano">
                Sano
              </label>
            </div>
          </div>

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
                  <td>{ingrediente.precio}</td>
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
