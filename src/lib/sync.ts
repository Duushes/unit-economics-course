import { supabase } from './supabase';
import { encryptJSON, decryptJSON } from './crypto';

// Строка прогресса в Supabase: { user_id, payload (шифртекст), salt, updated_at }.
// payload шифруется на клиенте — сервер видит только шифртекст.

export async function fetchRow(userId: string): Promise<{ payload: string; salt: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('progress').select('payload, salt').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return data as { payload: string; salt: string };
}

export async function pull<T>(userId: string, password: string): Promise<T | null> {
  const row = await fetchRow(userId);
  if (!row?.payload || !row?.salt) return null;
  try {
    return await decryptJSON<T>(row.payload, password, row.salt);
  } catch {
    // неверный пароль или повреждённые данные — не роняем приложение
    return null;
  }
}

export async function push(userId: string, obj: unknown, password: string, salt: string): Promise<void> {
  if (!supabase) return;
  const payload = await encryptJSON(obj, password, salt);
  await supabase.from('progress').upsert({
    user_id: userId,
    payload,
    salt,
    updated_at: new Date().toISOString(),
  });
}
