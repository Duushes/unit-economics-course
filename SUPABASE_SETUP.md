# Подключение авторизации (Supabase) — 5 минут

Курс работает **без** этого шага (гость-режим, прогресс в localStorage). Настройка ниже включает
вход по почте+паролю и облачный синк прогресса (кросс-устройство). Прогресс шифруется на клиенте
(AES-GCM, ключ из пароля), в базе лежит только шифртекст.

## 1. Создать проект
1. Зайти на <https://supabase.com>, создать проект (бесплатный tier).
2. Project Settings → **API**: скопировать `Project URL` и `anon public` ключ.

## 2. Создать таблицу и политику доступа
SQL Editor → выполнить:

```sql
create table if not exists public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  payload text not null,
  salt text not null,
  updated_at timestamptz default now()
);

alter table public.progress enable row level security;

create policy "own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

(Опционально) Authentication → Providers → Email: выключить «Confirm email», чтобы вход был сразу
без подтверждения по письму.

## 3. Локально
Создать `course-app/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ваш>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

`npm run dev` — в хабе появится «Войти, чтобы сохранять прогресс».

## 4. Прод (GitHub Pages)
1. Репозиторий → Settings → Secrets and variables → **Actions** → добавить два secret:
   `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Workflow `deploy.yml` уже передаёт их в шаг сборки — просто запушить/перезапустить деплой.

## Заметки
- anon-ключ публичный по дизайну; доступ к данным защищён RLS (каждый видит только свои строки).
- Ключ шифрования выводится из пароля и хранится в `sessionStorage` (живёт до закрытия вкладки).
  После закрытия вкладки для синка нужен повторный вход. Смена пароля делает старый шифртекст
  нечитаемым — это осознанный компромисс E2E-шифрования.
