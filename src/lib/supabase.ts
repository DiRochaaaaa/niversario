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
  console.log('=== Supabase Client Debug ===');
  console.log('Using real Supabase client');
  console.log('URL:', supabaseUrl);
  console.log('Key starts with:', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { fetch: (...args) => fetch(...args) }
    });
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabase = mockClient;
  }
} else {
  console.warn('=== Supabase Client Debug ===');
  console.warn('Using mock client because:');
  console.warn('- window exists:', typeof window !== 'undefined');
  console.warn('- has URL:', !!supabaseUrl);
  console.warn('- has key:', !!supabaseAnonKey);
  supabase = mockClient;
}

export { supabase } 