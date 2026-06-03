import { supabase } from '../supabaseClient'

export async function iniciarSesionConEmail(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function consultarUsuarioActual() {
  return supabase.auth.getUser()
}

export async function consultarSesionActual() {
  return supabase.auth.getSession()
}

export async function consultarPerfilUsuario(userId) {
  return supabase
    .from('users')
    .select('nombre, rol')
    .eq('id', userId)
    .single()
}

export async function cerrarSesionActual() {
  return supabase.auth.signOut()
}
