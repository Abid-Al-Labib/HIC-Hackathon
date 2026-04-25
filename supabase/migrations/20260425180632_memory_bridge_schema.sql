-- MemoryBridge Schema
-- Covers: patients, memories, memory assets, person profiles, music entries, mood logs

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

create type user_role as enum (
  'patient',
  'primary_caregiver',
  'family_contributor',
  'doctor',
  'facility_staff'
);

create type memory_type as enum (
  'photo', 'video', 'audio', 'story', 'music', 'sensory', 'life_event'
);

create type life_period as enum (
  'childhood', 'young_adult', 'middle_age', 'recent'
);

create type emotion_tag as enum (
  'joyful', 'peaceful', 'proud', 'loving', 'funny', 'bittersweet'
);

create type memory_status as enum (
  'draft', 'submitted', 'approved', 'flagged', 'archived'
);

create type dementia_stage as enum (
  'early', 'moderate', 'advanced'
);

create type mood_type as enum (
  'happy', 'calm', 'confused', 'upset'
);

create type asset_type as enum (
  'photo', 'video', 'audio', 'document'
);

create type relationship_type as enum (
  'spouse', 'child', 'grandchild', 'sibling', 'friend', 'other'
);

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────

create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null,
  role              user_role not null default 'family_contributor',
  profile_photo_url text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'family_contributor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- PATIENTS
-- ─────────────────────────────────────────

create table public.patients (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references public.profiles(id) on delete set null,
  first_name           text not null,
  last_name            text not null,
  preferred_name       text not null,
  date_of_birth        date not null,
  diagnosis_date       date,
  dementia_type        text,
  stage                dementia_stage not null default 'early',
  primary_caregiver_id uuid not null references public.profiles(id),
  doctor_id            uuid references public.profiles(id),
  program_week         smallint not null default 1 check (program_week between 1 and 12),
  program_started_at   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- PATIENT COLLABORATORS (ACL)
-- ─────────────────────────────────────────

create table public.patient_collaborators (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  role        user_role not null,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (patient_id, profile_id)
);

-- ─────────────────────────────────────────
-- PERSON PROFILES (named people in patient's life)
-- ─────────────────────────────────────────

create table public.person_profiles (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references public.patients(id) on delete cascade,
  name             text not null,
  relationship     relationship_type not null default 'other',
  photo_url        text,
  voice_sample_url text,
  is_alive         boolean not null default true,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- MEMORIES
-- ─────────────────────────────────────────

create table public.memories (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null references public.patients(id) on delete cascade,
  contributor_id      uuid not null references public.profiles(id),
  title               text not null,
  description         text,
  type                memory_type not null,
  life_period         life_period,
  emotion_tags        emotion_tag[] not null default '{}',
  people_tagged       uuid[] not null default '{}',
  location_name       text,
  location_lat        double precision,
  location_lng        double precision,
  sensory_cues        jsonb not null default '{"smells":[],"sounds":[],"textures":[],"tastes":[]}',
  therapeutic_score   smallint check (therapeutic_score between 1 and 5),
  status              memory_status not null default 'draft',
  ai_conversation_log jsonb,
  program_week        smallint check (program_week between 1 and 12),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index memories_patient_id_idx  on public.memories(patient_id);
create index memories_status_idx      on public.memories(status);
create index memories_life_period_idx on public.memories(life_period);

-- ─────────────────────────────────────────
-- MEMORY ASSETS (files attached to a memory)
-- ─────────────────────────────────────────

create table public.memory_assets (
  id               uuid primary key default gen_random_uuid(),
  memory_id        uuid not null references public.memories(id) on delete cascade,
  type             asset_type not null,
  file_url         text not null,
  file_size        bigint,
  duration_seconds integer,
  ai_description   text,
  created_at       timestamptz not null default now()
);

create index memory_assets_memory_id_idx on public.memory_assets(memory_id);

-- ─────────────────────────────────────────
-- MUSIC ENTRIES
-- ─────────────────────────────────────────

create table public.music_entries (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.patients(id) on delete cascade,
  song_title     text not null,
  artist         text not null,
  significance   text,
  life_period    life_period,
  streaming_link text,
  added_by       uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

create index music_entries_patient_id_idx on public.music_entries(patient_id);

-- ─────────────────────────────────────────
-- MOOD LOGS
-- ─────────────────────────────────────────

create table public.mood_logs (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  logged_by  uuid references public.profiles(id),
  mood       mood_type not null,
  notes      text,
  logged_at  timestamptz not null default now()
);

create index mood_logs_patient_id_idx on public.mood_logs(patient_id);
create index mood_logs_logged_at_idx  on public.mood_logs(logged_at desc);

-- ─────────────────────────────────────────
-- INVITES
-- ─────────────────────────────────────────

create table public.invites (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references public.patients(id) on delete cascade,
  invited_by   uuid not null references public.profiles(id),
  invite_email text not null,
  role         user_role not null default 'family_contributor',
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  status       text not null default 'pending' check (status in ('pending','accepted','expired')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '7 days')
);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger patients_updated_at
  before update on public.patients
  for each row execute procedure public.set_updated_at();

create trigger memories_updated_at
  before update on public.memories
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

alter table public.profiles              enable row level security;
alter table public.patients              enable row level security;
alter table public.patient_collaborators enable row level security;
alter table public.person_profiles       enable row level security;
alter table public.memories              enable row level security;
alter table public.memory_assets         enable row level security;
alter table public.music_entries         enable row level security;
alter table public.mood_logs             enable row level security;
alter table public.invites               enable row level security;

-- Helper: is current user a collaborator (or primary caregiver) for a patient?
create or replace function public.is_patient_collaborator(p_patient_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.patients
    where id = p_patient_id and primary_caregiver_id = auth.uid()
  )
  or exists (
    select 1 from public.patient_collaborators
    where patient_id = p_patient_id
      and profile_id = auth.uid()
      and accepted_at is not null
  );
$$;

-- profiles
create policy "profiles: own row"
  on public.profiles for all
  using (id = auth.uid());

-- patients
create policy "patients: collaborators read"
  on public.patients for select
  using (public.is_patient_collaborator(id));

create policy "patients: caregiver insert"
  on public.patients for insert
  with check (primary_caregiver_id = auth.uid());

create policy "patients: caregiver update"
  on public.patients for update
  using (primary_caregiver_id = auth.uid());

-- memories
create policy "memories: collaborators read"
  on public.memories for select
  using (
    public.is_patient_collaborator(patient_id)
    and (status = 'approved' or contributor_id = auth.uid())
  );

create policy "memories: contributors insert"
  on public.memories for insert
  with check (
    public.is_patient_collaborator(patient_id)
    and contributor_id = auth.uid()
  );

create policy "memories: caregiver update"
  on public.memories for update
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

-- memory_assets
create policy "memory_assets: follow memory"
  on public.memory_assets for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_id
        and public.is_patient_collaborator(m.patient_id)
    )
  );

create policy "memory_assets: contributor insert"
  on public.memory_assets for insert
  with check (
    exists (
      select 1 from public.memories m
      where m.id = memory_id and m.contributor_id = auth.uid()
    )
  );

-- person_profiles
create policy "person_profiles: collaborators read"
  on public.person_profiles for select
  using (public.is_patient_collaborator(patient_id));

create policy "person_profiles: caregiver write"
  on public.person_profiles for all
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

-- music_entries
create policy "music_entries: collaborators read"
  on public.music_entries for select
  using (public.is_patient_collaborator(patient_id));

create policy "music_entries: collaborators insert"
  on public.music_entries for insert
  with check (public.is_patient_collaborator(patient_id));

-- mood_logs
create policy "mood_logs: collaborators read"
  on public.mood_logs for select
  using (public.is_patient_collaborator(patient_id));

create policy "mood_logs: collaborators insert"
  on public.mood_logs for insert
  with check (public.is_patient_collaborator(patient_id));

-- invites
create policy "invites: caregiver manages"
  on public.invites for all
  using (invited_by = auth.uid());

-- ─────────────────────────────────────────
-- STORAGE BUCKET for memory files
-- ─────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-assets',
  'memory-assets',
  false,
  52428800,  -- 50 MB per file
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/webm',
    'video/mp4', 'video/quicktime'
  ]
)
on conflict (id) do nothing;

create policy "memory-assets: auth read"
  on storage.objects for select
  using (bucket_id = 'memory-assets' and auth.role() = 'authenticated');

create policy "memory-assets: auth upload"
  on storage.objects for insert
  with check (bucket_id = 'memory-assets' and auth.role() = 'authenticated');
