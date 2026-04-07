// Cliente de Supabase con service_role key.


import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      // El backend maneja auth con JWT propio, no con Supabase Auth
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default supabase;
