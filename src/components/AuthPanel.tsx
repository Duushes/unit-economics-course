'use client';

import { useState } from 'react';
import { useCourse } from '@/context/CourseContext';

export default function AuthPanel() {
  const { authEnabled, user, authError, signIn, signUp, signOut } = useCourse();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  // Без ключей Supabase панель скрыта — курс работает в гость-режиме (localStorage).
  if (!authEnabled) return null;

  if (user) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 mb-6 text-sm">
        <span className="text-muted-foreground truncate">
          Синхронизация включена: <span className="text-foreground">{user.email}</span>
        </span>
        <button onClick={signOut} className="text-xs text-muted-foreground hover:text-error transition-colors cursor-pointer">
          Выйти
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!email || !pw) return;
    setBusy(true);
    const ok = mode === 'in' ? await signIn(email, pw) : await signUp(email, pw);
    setBusy(false);
    if (ok) {
      setOpen(false);
      setPw('');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-border hover:border-accent/50 px-4 py-2.5 mb-6 text-sm text-left text-muted-foreground transition-colors cursor-pointer"
      >
        Войти, чтобы сохранять прогресс между устройствами →
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-6">
      <div className="flex gap-4 mb-3 text-sm">
        <button onClick={() => setMode('in')} className={`cursor-pointer ${mode === 'in' ? 'text-accent font-medium' : 'text-muted-foreground'}`}>Вход</button>
        <button onClick={() => setMode('up')} className={`cursor-pointer ${mode === 'up' ? 'text-accent font-medium' : 'text-muted-foreground'}`}>Регистрация</button>
        <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground text-xs cursor-pointer">Свернуть</button>
      </div>
      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Почта"
          className="w-full p-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:border-accent/50"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Пароль"
          className="w-full p-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:border-accent/50"
        />
        {authError && <p className="text-xs text-error">{authError}</p>}
        <button
          onClick={submit}
          disabled={busy || !email || !pw}
          className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? '…' : mode === 'in' ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <p className="text-[11px] text-muted-foreground/70">
          Прогресс шифруется на устройстве перед отправкой. Храним минимум — почту и зашифрованный прогресс.
        </p>
      </div>
    </div>
  );
}
