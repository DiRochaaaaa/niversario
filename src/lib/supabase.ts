import { createClient } from '@supabase/supabase-js'

// Usando valores vazios como fallback para evitar erros durante o build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Criando o cliente apenas se as variáveis de ambiente estiverem disponíveis
let supabase: ReturnType<typeof createClient> | null = null;

// Verificar se estamos em um ambiente de servidor e se as variáveis estão disponíveis
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  // Criando cliente com configurações para evitar conexões WebSocket
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true
    },
    global: {
      // Desabilitando completamente os recursos que dependem de WebSockets
      fetch: (...args) => fetch(...args)
    }
  })
} else {
  // Durante o build ou SSG, criamos um cliente vazio para evitar erros
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('Supabase client não inicializado durante o build. As variáveis de ambiente serão necessárias em runtime.')
  }
  
  // Criar um mock do cliente para evitar erros durante o build
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          data: [],
          error: null
        })
      }),
      insert: () => ({
        data: null,
        error: new Error('Supabase não está disponível durante o build')
      })
    })
  } as any;
}

export { supabase } 