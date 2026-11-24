-- Network Atlas: one row per saved key per person. The app writes {key, value, updated_ms}; the newest copy wins.
-- Row level security: every signed-in person can read and write ONLY their own rows.

create table if not exists public.atlas_progress (
  user_id    uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  key        text   not null check (key like 'network-atlas-%' and key not like 'network-atlas-sync-%' and length(key) <= 200),
  value      text            check (value is null or length(value) <= 1000000),
  updated_ms bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.atlas_progress enable row level security;

drop policy if exists "read own progress"   on public.atlas_progress;
drop policy if exists "insert own progress" on public.atlas_progress;
drop policy if exists "update own progress" on public.atlas_progress;
drop policy if exists "delete own progress" on public.atlas_progress;

create policy "read own progress"   on public.atlas_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own progress" on public.atlas_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own progress" on public.atlas_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own progress" on public.atlas_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- Nobody who is signed out can touch the table at all.
revoke all on public.atlas_progress from anon;
grant select, insert, update, delete on public.atlas_progress to authenticated;
