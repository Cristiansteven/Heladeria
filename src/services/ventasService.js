import { supabase } from '../supabaseClient'

export async function venderProducto(producto, user) {
  if (!user) {
    return {
      error: {
        message: 'Debes iniciar sesion para vender productos.',
      },
    }
  }

  if (!producto?.id) {
    return {
      error: {
        message: 'Selecciona un producto valido.',
      },
    }
  }

  if (!producto.ingredientes || producto.ingredientes.length !== 3) {
    return {
      error: {
        message: 'El producto debe tener 3 ingredientes asignados para poder venderse.',
      },
    }
  }

  const ingredienteSinInventario = producto.ingredientes.find(
    (ingrediente) => Number(ingrediente.inventario || 0) <= 0,
  )

  if (ingredienteSinInventario) {
    return {
      error: {
        message: `No hay inventario suficiente para ${ingredienteSinInventario.nombre}.`,
      },
    }
  }

  for (const ingrediente of producto.ingredientes) {
    const { error: inventarioError } = await supabase
      .from('ingredientes')
      .update({
        inventario: Number(ingrediente.inventario) - 1,
      })
      .eq('id', ingrediente.id)

    if (inventarioError) {
      return { error: inventarioError }
    }
  }

  const { data, error } = await supabase
    .from('ventas')
    .insert({
      producto_id: producto.id,
      user_id: user.id,
      cantidad: 1,
      total: Number(producto.precio_publico || 0),
    })
    .select()
    .single()

  return { data, error }
}

export async function consultarVentasDelDia() {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)

  const finDia = new Date()
  finDia.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('ventas')
    .select('cantidad, total')
    .gte('fecha', inicioDia.toISOString())
    .lte('fecha', finDia.toISOString())

  if (error) {
    return { data: null, error }
  }

  const resumen = (data || []).reduce(
    (totalVentas, venta) => ({
      cantidad: totalVentas.cantidad + Number(venta.cantidad || 0),
      total: totalVentas.total + Number(venta.total || 0),
    }),
    { cantidad: 0, total: 0 },
  )

  return { data: resumen, error: null }
}
