// supabase.js
const SUPABASE_URL = "https://besvxvveddtrlxfqnnwn.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_W3YwddPuixfxWU1Oj_7xVw_qxZKiW1s";

// Mantenha apenas ESTA inicialização
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Crie um atalho para evitar erro de 'undefined' no papiro.js
window.supabase = window.supabaseClient;