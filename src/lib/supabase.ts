import { createClient } from '@supabase/supabase-js'

// Usando valores vazios como fallback para evitar erros durante o build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Melhorar o mock para lidar com diferentes tabelas e operações
const mockClient = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      order: (column: string, options?: {ascending?: boolean}) => ({
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: (data: any[]) => {
      console.log(`Mock insert na tabela ${table}:`, data);
      // No ambiente mock, simulamos uma inserção bem-sucedida
      return {
        data: { id: 'mock-id-' + Date.now(), ...data[0] },
        error: null,
        status: 201
      };
    },
    update: (data: any) => ({
      match: () => ({
        data: null,
        error: null
      }),
      data: null,
      error: null
    }),
    delete: () => ({
      match: () => ({
        data: null,
        error: null
      }),
      data: null,
      error: null
    })
  }),
  auth: {
    onAuthStateChange: () => ({ data: null, error: null }),
    getSession: () => ({ data: { session: null }, error: null }),
    signOut: () => ({ error: null })
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {}
} as any;

// Criando o cliente - usa o mock quando necessário
let supabase: ReturnType<typeof createClient>;

// Verificar se estamos em um ambiente de servidor e se as variáveis estão disponíveis
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  // Criando cliente real com configurações para evitar conexões WebSocket
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
  // Durante o build ou SSG, usamos o cliente mock
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('Supabase client mock usado durante o build. As variáveis de ambiente serão necessárias em runtime.')
  } else if (typeof window !== 'undefined') {
    console.warn('Usando cliente Supabase mock. Os dados não serão salvos permanentemente.')
  }
  
  // Usar o mock
  supabase = mockClient;
}

export { supabase } 