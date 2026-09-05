alter table public.profiles
  add column if not exists rating numeric(3, 2) not null default 0,
  add column if not exists reviews_count integer not null default 0;

alter table public.mentors
  add column if not exists name text,
  add column if not exists location text,
  add column if not exists rating numeric(3, 2) not null default 0,
  add column if not exists reviews_count integer not null default 0,
  add column if not exists avatar text,
  add column if not exists teaches text[] not null default '{}',
  add column if not exists wants_to_learn text[] not null default '{}',
  add column if not exists availability text,
  add column if not exists bio text,
  add column if not exists is_online boolean not null default true,
  add column if not exists sessions_count integer not null default 0;

alter table public.mentors enable row level security;

drop policy if exists "Authenticated users can create their mentor record" on public.mentors;
create policy "Authenticated users can create their mentor record"
  on public.mentors for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their mentor record" on public.mentors;
create policy "Users can update their mentor record"
  on public.mentors for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into public.mentors (
  user_id,
  name,
  location,
  rating,
  reviews_count,
  avatar,
  teaches,
  wants_to_learn,
  availability,
  bio,
  is_online,
  sessions_count
)
select
  p.id,
  coalesce(p.name, 'Community Member'),
  'Remote',
  coalesce(p.rating, 0),
  coalesce(p.reviews_count, 0),
  p.avatar,
  coalesce(
    array(
      select jsonb_array_elements_text(
        case when jsonb_typeof(p.skills_teach) = 'array' then p.skills_teach else '[]'::jsonb end
      )
    ),
    '{}'::text[]
  ),
  coalesce(
    array(
      select jsonb_array_elements_text(
        case when jsonb_typeof(p.skills_learn) = 'array' then p.skills_learn else '[]'::jsonb end
      )
    ),
    '{}'::text[]
  ),
  '2h/week available',
  coalesce(p.bio, ''),
  true,
  0
from public.profiles p
where not exists (
  select 1 from public.mentors m where m.user_id = p.id
);
