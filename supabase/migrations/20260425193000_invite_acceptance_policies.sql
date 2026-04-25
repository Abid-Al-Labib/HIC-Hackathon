-- Invite acceptance and contributor memory updates

drop policy if exists "invites: caregiver manages" on public.invites;

create policy "invites: caregiver manages own patient invites"
  on public.invites for all
  using (
    invited_by = auth.uid()
    and exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  )
  with check (
    invited_by = auth.uid()
    and exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

create policy "invites: invited email can read pending invite"
  on public.invites for select
  using (
    status = 'pending'
    and lower(invite_email) = lower(auth.jwt()->>'email')
  );

create policy "invites: invited email can accept pending invite"
  on public.invites for update
  using (
    status = 'pending'
    and lower(invite_email) = lower(auth.jwt()->>'email')
  )
  with check (
    status = 'accepted'
    and lower(invite_email) = lower(auth.jwt()->>'email')
  );

create policy "patient_collaborators: self or caregiver read"
  on public.patient_collaborators for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.patients
      where id = patient_id and primary_caregiver_id = auth.uid()
    )
  );

create policy "patient_collaborators: invited user accepts"
  on public.patient_collaborators for insert
  with check (
    profile_id = auth.uid()
    and accepted_at is not null
    and exists (
      select 1 from public.invites i
      where i.patient_id = patient_collaborators.patient_id
        and i.role = patient_collaborators.role
        and i.status = 'pending'
        and lower(i.invite_email) = lower(auth.jwt()->>'email')
    )
  );

create policy "memories: contributor update own submitted"
  on public.memories for update
  using (
    contributor_id = auth.uid()
    and status in ('draft', 'submitted', 'flagged')
  )
  with check (
    contributor_id = auth.uid()
    and status in ('draft', 'submitted')
  );
