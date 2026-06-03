import { supabase } from '../supabaseClient'

export async function consultarIngredientesPorProducto(productoId) {
  return supabase
    .from('producto_ingrediente')
    .select(`
      id,
      producto_id,
      ingrediente_id,
      ingredientes (
        id,
        nombre,
        precio,
        calorias,
        inventario,
        tipo,
        sabor
      )
    `)
    .eq('producto_id', productoId)
}

export async function reemplazarIngredientesDeProducto(productoId, ingredienteIds) {
  const { error: deleteError } = await supabase
    .from('producto_ingrediente')
    .delete()
    .eq('producto_id', productoId)

  if (deleteError) {
    return { data: null, error: deleteError }
  }

  const relaciones = ingredienteIds.map((ingredienteId) => ({
    producto_id: productoId,
    ingrediente_id: ingredienteId,
  }))

  return supabase
    .from('producto_ingrediente')
    .insert(relaciones)
    .select()
}
