import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criando cliente com configurações para evitar conexões WebSocket
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  global: {
    // Desabilitando completamente os recursos que dependem de WebSockets
    fetch: (...args) => fetch(...args)
  }
}) 