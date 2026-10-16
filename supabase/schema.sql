-- ============================================================
-- Campus Clearance System — consolidated schema
-- Run this once in the Supabase SQL editor on a fresh project.
-- ============================================================

create type user_role as enum ('student', 'officer', 'administrator');
create type review_decision as enum ('pending', 'approved', 'rejected');
create type exit_status as enum ('pending', 'approved', 'rejected');

create table clearance_stages (
  id serial primary key,
  name text unique not null,
  stage_order int unique not null
);

insert into clearance_stages (name, stage_order) values
  ('bursary', 1),
  ('library', 2),
  ('hostel', 3),
  ('department_head', 4),
  ('student_affairs', 5);

-- role: student | officer | administrator
-- stage: only set for officers — which clearance stage they handle
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'student',
  stage text references clearance_stages (name),
  created_at timestamptz not null default now()
);

create table student_profiles (
  id uuid primary key references profiles (id) on delete cascade,
  matric_number text unique not null,
  department text,
  faculty text,
  level text,
  created_at timestamptz not null default now()
);

create table clearance_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  session text not null,
  status text not null default 'pending' check (status in ('pending', 'cleared')),
  created_at timestamptz not null default now(),
  unique (student_id, session)
);

create table clearance_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clearance_applications (id) on delete cascade,
  stage_id int not null references clearance_stages (id),
  officer_id uuid references profiles (id),
  decision review_decision not null default 'pending',
  comments text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (application_id, stage_id)
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique not null references clearance_applications (id) on delete cascade,
  certificate_ref text unique not null,
  verification_code text unique not null,
  -- denormalized so the public verification page (anon role) doesn't need
  -- to read the profiles table, which RLS otherwise blocks for anon.
  student_name text,
  matric_number text,
  issued_at timestamptz not null default now()
);

create table exit_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references clearance_applications (id) on delete cascade,
  details text,
  status exit_status not null default 'pending',
  decision_by uuid references profiles (id),
  decision_at timestamptz,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Workflow automation
-- ============================================================

-- 1) Creating an application spawns one pending review row per stage.
create or replace function public.handle_new_application()
returns trigger as $$
begin
  insert into public.clearance_reviews (application_id, stage_id, decision)
  select new.id, id, 'pending' from public.clearance_stages;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger on_application_created
  after insert on public.clearance_applications
  for each row execute procedure public.handle_new_application();

-- 2) Enforce sequential review order; notify the student on each decision;
--    clear old rejection comments when a student resubmits.
create or replace function public.handle_review_decision()
returns trigger as $$
declare
  this_order int;
  earlier_incomplete int;
begin
  if new.decision = old.decision then
    return new;
  end if;

  select stage_order into this_order from public.clearance_stages where id = new.stage_id;

  if new.decision in ('approved', 'rejected') then
    select count(*) into earlier_incomplete
    from public.clearance_reviews r
    join public.clearance_stages s on s.id = r.stage_id
    where r.application_id = new.application_id
      and s.stage_order < this_order
      and r.decision <> 'approved';

    if earlier_incomplete > 0 then
      raise exception 'Earlier clearance stages must be approved first';
    end if;

    new.reviewed_at := now();

    insert into public.notifications (user_id, message)
    select student_id,
      case
        when new.decision = 'approved' then 'Your ' || (select name from public.clearance_stages where id = new.stage_id) || ' clearance was approved.'
        else 'Your ' || (select name from public.clearance_stages where id = new.stage_id) || ' clearance was rejected: ' || coalesce(new.comments, 'see officer for details')
      end
    from public.clearance_applications where id = new.application_id;

  elsif new.decision = 'pending' and old.decision = 'rejected' then
    new.comments := null;
    new.reviewed_at := null;

    insert into public.notifications (user_id, message)
    select officer_id, 'A student has resubmitted their ' || (select name from public.clearance_stages where id = new.stage_id) || ' clearance for review.'
    from public.clearance_reviews where id = new.id and officer_id is not null;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger on_review_decision
  before update on public.clearance_reviews
  for each row execute procedure public.handle_review_decision();

-- 3) After any approval, check whether ALL stages are now approved; if so,
--    mark the application CLEARED and issue a certificate (idempotent).
create or replace function public.check_application_cleared()
returns trigger as $$
declare
  total_stages int;
  approved_stages int;
  app_status text;
  cert_ref text;
  cert_code text;
  v_student_id uuid;
  v_name text;
  v_matric text;
begin
  if new.decision <> 'approved' then
    return new;
  end if;

  select count(*) into total_stages from public.clearance_stages;
  select count(*) into approved_stages
    from public.clearance_reviews
    where application_id = new.application_id and decision = 'approved';

  if approved_stages = total_stages then
    select status into app_status from public.clearance_applications where id = new.application_id;

    if app_status <> 'cleared' then
      update public.clearance_applications set status = 'cleared' where id = new.application_id;

      select a.student_id, p.full_name, sp.matric_number
        into v_student_id, v_name, v_matric
      from public.clearance_applications a
      join public.profiles p on p.id = a.student_id
      left join public.student_profiles sp on sp.id = a.student_id
      where a.id = new.application_id;

      cert_ref := 'CERT-' || to_char(now(), 'YYYY') || '-' || upper(substr(new.application_id::text, 1, 8));
      cert_code := upper(substr(md5(random()::text || new.application_id::text), 1, 10));

      insert into public.certificates (application_id, certificate_ref, verification_code, student_name, matric_number)
      values (new.application_id, cert_ref, cert_code, v_name, v_matric)
      on conflict (application_id) do nothing;

      insert into public.notifications (user_id, message)
      select student_id, 'Congratulations — your clearance is complete. Your certificate is ready to download.'
      from public.clearance_applications where id = new.application_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger on_review_approved
  after update on public.clearance_reviews
  for each row execute procedure public.check_application_cleared();

-- 4) Block exit requests unless the application is already CLEARED.
create or replace function public.check_exit_eligibility()
returns trigger as $$
declare
  app_status text;
begin
  select status into app_status from public.clearance_applications where id = new.application_id;
  if app_status is distinct from 'cleared' then
    raise exception 'Clearance must be fully approved before requesting exit';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger on_exit_request
  before insert on public.exit_requests
  for each row execute procedure public.check_exit_eligibility();

-- 5) Sign-up: everyone who self-registers becomes a 'student' — officer and
--    administrator accounts are never self-assignable. Admins promote staff
--    (and assign an officer's stage) afterwards from User Management.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  full_name text;
begin
  full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);

  insert into public.profiles (id, full_name, role)
  values (new.id, full_name, 'student'::public.user_role);

  if new.raw_user_meta_data ? 'matric_number' then
    insert into public.student_profiles (id, matric_number, department, faculty, level)
    values (
      new.id,
      new.raw_user_meta_data->>'matric_number',
      new.raw_user_meta_data->>'department',
      new.raw_user_meta_data->>'faculty',
      new.raw_user_meta_data->>'level'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table student_profiles enable row level security;
alter table clearance_stages enable row level security;
alter table clearance_applications enable row level security;
alter table clearance_reviews enable row level security;
alter table certificates enable row level security;
alter table exit_requests enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;

create policy "profiles readable by authenticated" on profiles
  for select to authenticated using (true);
create policy "users update own profile" on profiles
  for update to authenticated using (auth.uid() = id);

create policy "stages readable by authenticated" on clearance_stages
  for select to authenticated using (true);

create policy "student profile readable" on student_profiles
  for select to authenticated using (
    id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "student profile insert self" on student_profiles
  for insert to authenticated with check (id = auth.uid());
create policy "student profile update self" on student_profiles
  for update to authenticated using (id = auth.uid());

create policy "applications readable" on clearance_applications
  for select to authenticated using (
    student_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "applications insert self" on clearance_applications
  for insert to authenticated with check (student_id = auth.uid());

create policy "reviews readable" on clearance_reviews
  for select to authenticated using (
    exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "reviews updatable by staff" on clearance_reviews
  for update to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "students can resubmit rejected stage" on clearance_reviews
  for update to authenticated using (
    decision = 'rejected'
    and exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
  )
  with check (
    exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
  );

create policy "certificates readable by owner or staff" on certificates
  for select to authenticated using (
    exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "certificates publicly verifiable" on certificates
  for select to anon using (true);

create policy "exit requests readable" on exit_requests
  for select to authenticated using (
    exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "exit requests insert by student" on exit_requests
  for insert to authenticated with check (
    exists (select 1 from clearance_applications a where a.id = application_id and a.student_id = auth.uid())
  );
create policy "exit requests updatable by staff" on exit_requests
  for update to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );

create policy "notifications readable by owner" on notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications updatable by owner" on notifications
  for update to authenticated using (user_id = auth.uid());

create policy "activity log readable by staff" on activity_logs
  for select to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('officer', 'administrator'))
  );
create policy "activity log insert by authenticated" on activity_logs
  for insert to authenticated with check (true);

-- ============================================================
-- Relationship needed by the officer queue (PostgREST embeds across
-- foreign keys): clearance_applications.student_id -> student_profiles.id
-- ============================================================
alter table clearance_applications
  add constraint clearance_applications_student_profile_fkey
  foreign key (student_id) references student_profiles (id) on delete cascade;

-- Administrators must be able to update OTHER people's profiles (role, stage)
-- from User Management; the "update own profile" policy alone blocks that.
create policy "administrators can update any profile" on profiles
  for update to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'administrator')
  );
