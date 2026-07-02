import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Ключи публичные по дизайну (безопасность на RLS). Задаются в .env.local
// и в GitHub Actions secrets. Без ключей auth выключен — курс работает как гость.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isAuthEnabled
  ? createClient(url as string, anonKey as string)
  : null;
