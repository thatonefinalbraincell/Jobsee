-- Enable PostGIS for distance-based location metrics
create extension if not exists postgis;

-- Enum Types
create type user_role as enum ('student', 'employer', 'admin');
create type job_type as enum ('part-time', 'internship');
create type application_status as enum ('pending', 'reviewed', 'accepted', 'rejected');

-- 1. Profiles Table (Linked to Supabase Auth)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role user_role not null,
    full_name text not null,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Student Profiles Table
create table public.student_profiles (
    id uuid references public.profiles(id) on delete cascade primary key,
    college text not null,
    department text not null,
    skills text[] default '{}',
    availability jsonb default '{"days": [], "hours": ""}'::jsonb,
    resume_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Employer Profiles Table
create table public.employer_profiles (
    id uuid references public.profiles(id) on delete cascade primary key,
    company_name text not null,
    description text,
    website text,
    contact_phone text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Job Posts Table
create table public.job_posts (
    id uuid default gen_random_uuid() primary key,
    employer_id uuid references public.employer_profiles(id) on delete cascade not null,
    title text not null,
    description text not null,
    type job_type not null,
    skills_required text[] default '{}',
    pay_amount numeric(10, 2) not null,
    pay_period text default 'hour', -- hour, month, lump-sum
    duration text, -- e.g., "3 months"
    openings integer default 1,
    location_address text not null,
    location_geo geography(Point, 4326) not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Job Applications Table
create table public.job_applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.job_posts(id) on delete cascade not null,
    student_id uuid references public.student_profiles(id) on delete cascade not null,
    status application_status default 'pending' not null,
    cover_letter text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(job_id, student_id)
);

-- INDEXING FOR PERFORMANCE
create index idx_job_posts_geo on public.job_posts using gist(location_geo);
create index idx_job_posts_skills on public.job_posts using gin(skills_required);
create index idx_applications_student on public.job_applications(student_id);
create index idx_applications_job on public.job_applications(job_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.job_posts enable row level security;
alter table public.job_applications enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Student Profiles Policies
create policy "Student profiles are viewable by authenticated users" on public.student_profiles for select using (auth.role() = 'authenticated');
create policy "Students can modify their own profile" on public.student_profiles for all using (auth.uid() = id);

-- Employer Profiles Policies
create policy "Employer profiles are viewable by everyone" on public.employer_profiles for select using (true);
create policy "Employers can modify their own profile" on public.employer_profiles for all using (auth.uid() = id);

-- Job Posts Policies
create policy "Jobs are viewable by everyone" on public.job_posts for select using (is_active = true);
create policy "Employers can insert jobs" on public.job_posts for insert with check (auth.uid() = employer_id);
create policy "Employers can update their own jobs" on public.job_posts for update using (auth.uid() = employer_id);

-- Job Applications Policies
create policy "Students can view their own applications" on public.job_applications for select using (auth.uid() = student_id);
create policy "Students can submit applications" on public.job_applications for insert with check (auth.uid() = student_id);
create policy "Employers can view applications for their jobs" on public.job_applications for select using (
    exists (select 1 from public.job_posts where id = job_id and employer_id = auth.uid())
);
create policy "Employers can update application status" on public.job_applications for update using (
    exists (select 1 from public.job_posts where id = job_id and employer_id = auth.uid())
);

-- AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Anonymous User'), 
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();