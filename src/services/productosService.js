import { supabase } from '../supabaseClient'

export async function consultarProductosConIngredientes() {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_ingrediente (
        ingrediente_id,
        ingredientes (
          id,
          nombre,
          precio,
          calorias,
          inventario
        )
      )
    `)

  if (error) {
    return { data: null, error }
  }

  const productosCalculados = (data || []).map((producto) => {
    const ingredientes = (producto.producto_ingrediente || [])
      .map((relacion) => relacion.ingredientes)
      .filter(Boolean)

    const costo = ingredientes.reduce(
      (total, ingrediente) => total + Number(ingrediente.precio || 0),
      0,
    )
    const calorias = ingredientes.reduce(
      (total, ingrediente) => total + Number(ingrediente.calorias || 0),
      0,
    )
    const precioPublico = Number(producto.precio_publico || 0)
    const inventarios = ingredientes.map((ingrediente) => Number(ingrediente.inventario || 0))
    const inventarioDisponible = inventarios.length === 3 ? Math.min(...inventarios) : 0

    return {
      ...producto,
      ingredientes,
      costo,
      calorias,
      inventarioDisponible,
      rentabilidad: precioPublico - costo,
    }
  })

  return { data: productosCalculados, error: null }
}

export async function agregarUnidadesDisponiblesProducto(producto, unidades) {
  if (!producto.ingredientes || producto.ingredientes.length !== 3) {
    return {
      error: {
        message: 'El producto debe tener 3 ingredientes asignados para agregar unidades.',
      },
    }
  }

  if (!Number.isInteger(unidades) || unidades <= 0) {
    return {
      error: {
        message: 'Ingresa una cantidad valida mayor a 0.',
      },
    }
  }

  const respuestas = await Promise.all(
    producto.ingredientes.map((ingrediente) =>
      supabase
        .from('ingredientes')
        .update({
          inventario: Number(ingrediente.inventario || 0) + unidades,
        })
        .eq('id', ingrediente.id),
    ),
  )

  const respuestaConError = respuestas.find((respuesta) => respuesta.error)

  if (respuestaConError) {
    return { error: respuestaConError.error }
  }

  return { data: true, error: null }
}
