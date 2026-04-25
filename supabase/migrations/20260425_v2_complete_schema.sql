-- V2: Add missing tables from full spec
-- facilities, care_transition_summaries, generated_content, therapy_sessions
-- plus alter patients to add facility_id and program_status

-- ─────────────────────────────────────────
-- FACILITIES
-- ─────────────────────────────────────────

create table public.facilities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  phone      text,
  type       text not null check (type in ('nursing_home','assisted_living','memory_care','other')),
  created_at timestamptz not null default now()
);

alter table public.facilities enable row level security;

create policy "facilities: authenticated read"
  on public.facilities for select
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- ALTER PATIENTS
-- ─────────────────────────────────────────

alter table public.patients
  add column if not exists facility_id    uuid references public.facilities(id) on delete set null,
  add column if not exists program_status text not null default 'not_started'
    check (program_status in ('not_started','in_progress','completed')),
  add column if not exists program_started_at timestamptz;

-- ─────────────────────────────────────────
-- GENERATED CONTENT
-- ─────────────────────────────────────────

create table public.generated_content (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.patients(id) on delete cascade,
  source_memory_ids  uuid[] not null default '{}',
  type               text not null check (type in ('narrative','voice_script','scene_brief','care_summary')),
  content            text not null,
  voice_audio_url    text,
  status             text not null default 'generated'
    check (status in ('generated','caregiver_reviewed','approved','archived')),
  program_week       smallint check (program_week between 1 and 12),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index generated_content_patient_id_idx on public.generated_content(patient_id);
create index generated_content_type_idx       on public.generated_content(type);

alter table public.generated_content enable row level security;

create trigger generated_content_updated_at
  before update on public.generated_content
  for each row execute procedure public.set_updated_at();

create policy "generated_content: collaborators read"
  on public.generated_content for select
  using (public.is_patient_collaborator(patient_id));

create policy "generated_content: caregiver write"
  on public.generated_content for all
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- THERAPY SESSIONS
-- ─────────────────────────────────────────

create table public.therapy_sessions (
  id                   uuid primary key default gen_random_uuid(),
  patient_id           uuid not null references public.patients(id) on delete cascade,
  program_week         smallint not null check (program_week between 1 and 12),
  session_type         text not null check (session_type in ('music','photo_slideshow','voice_narrative','multi_sensory')),
  content_ids          uuid[] not null default '{}',
  scheduled_date       date,
  completed            boolean not null default false,
  patient_mood_before  mood_type,
  patient_mood_after   mood_type,
  caregiver_notes      text,
  created_at           timestamptz not null default now()
);

create index therapy_sessions_patient_id_idx on public.therapy_sessions(patient_id);

alter table public.therapy_sessions enable row level security;

create policy "therapy_sessions: collaborators read"
  on public.therapy_sessions for select
  using (public.is_patient_collaborator(patient_id));

create policy "therapy_sessions: caregiver write"
  on public.therapy_sessions for all
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- CARE TRANSITION SUMMARIES
-- ─────────────────────────────────────────

create table public.care_transition_summaries (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid not null references public.patients(id) on delete cascade,
  generated_by            uuid not null references public.profiles(id),
  version                 integer not null default 1,
  content                 jsonb not null default '{}',
  pdf_url                 text,
  shared_with_facility_id uuid references public.facilities(id),
  shared_at               timestamptz,
  created_at              timestamptz not null default now()
);

create index care_transition_summaries_patient_id_idx on public.care_transition_summaries(patient_id);

alter table public.care_transition_summaries enable row level security;

create policy "care_summaries: collaborators read"
  on public.care_transition_summaries for select
  using (public.is_patient_collaborator(patient_id));

create policy "care_summaries: caregiver write"
  on public.care_transition_summaries for all
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- CLINICAL NOTES (doctor / facility staff)
-- ─────────────────────────────────────────

create table public.clinical_notes (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  author_id   uuid not null references public.profiles(id),
  note        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index clinical_notes_patient_id_idx on public.clinical_notes(patient_id);

alter table public.clinical_notes enable row level security;

create trigger clinical_notes_updated_at
  before update on public.clinical_notes
  for each row execute procedure public.set_updated_at();

create policy "clinical_notes: caregiver+doctor read"
  on public.clinical_notes for select
  using (public.is_patient_collaborator(patient_id));

create policy "clinical_notes: doctor+staff write"
  on public.clinical_notes for insert
  with check (author_id = auth.uid());

create policy "clinical_notes: author update"
  on public.clinical_notes for update
  using (author_id = auth.uid());
