import { supabase } from '../supabaseClient'

export async function consultarIngredientes() {
  return supabase
    .from('ingredientes')
    .select('*')
    .order('id', { ascending: true })
}

export async function crearIngrediente(ingrediente) {
  return supabase
    .from('ingredientes')
    .insert(ingrediente)
    .select()
    .single()
}

export async function actualizarIngrediente(id, ingrediente) {
  return supabase
    .from('ingredientes')
    .update(ingrediente)
    .eq('id', id)
    .select()
    .single()
}

export async function eliminarIngrediente(id) {
  return supabase
    .from('ingredientes')
    .delete()
    .eq('id', id)
}
