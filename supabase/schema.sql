-- Woodshed practice history. Run once in the Supabase SQL editor.
-- No accounts: each request sends its sync code in the x-device-id header, and RLS only lets it touch rows with that device_id.

create table if not exists public.practice_log (
  id uuid primary key,
  device_id uuid not null,
  practiced_at timestamptz not null,
  updated_at timestamptz not null,
  track_id text,
  session_id text,
  minutes smallint,
  exercise_id text not null,
  variant smallint not null default 0,
  kind text not null,
  bpm smallint,
  rating smallint check (rating between 1 and 3),
  seconds integer not null check (seconds >= 0)
);

create index if not exists practice_log_device_idx on public.practice_log (device_id, practiced_at desc);

alter table public.practice_log enable row level security;

-- Returns null (so nothing matches) when the header is missing or is not a UUID.
create or replace function public.request_device_id() returns uuid
language plpgsql stable as $$
declare raw text := current_setting('request.headers', true)::json ->> 'x-device-id';
begin
  return raw::uuid;
exception when others then
  return null;
end $$;

drop policy if exists "own device rows" on public.practice_log;
create policy "own device rows" on public.practice_log
  for all to anon
  using (device_id = public.request_device_id())
  with check (device_id = public.request_device_id());

grant select, insert, update on public.practice_log to anon;
