import { supabase } from '../supabaseClient'

export async function consultarProductos() {
  return supabase
    .from('productos')
    .select('*')
}
