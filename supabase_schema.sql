-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (clean setup)
drop table if exists public.transactions cascade;
drop table if exists public.user_vouchers cascade;
drop table if exists public.volunteer_tasks cascade;
drop table if exists public.report_chats cascade;
drop table if exists public.reports cascade;
drop table if exists public.teams cascade;
drop table if exists public.project_members cascade;
drop table if exists public.projects cascade;
drop table if exists public.proposals cascade;
drop table if exists public.profiles cascade;

-- 1. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('volunteer', 'staff')),
  phone text,
  email text,
  nik text, -- volunteer only
  address text, -- volunteer only
  staff_id text, -- staff only
  department text, -- staff only
  points integer default 1250,
  cash_balance integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Reports Table
create table public.reports (
  id text primary key,
  title text not null,
  location text not null,
  time text not null,
  status text not null check (status in ('New', 'Processing', 'Needs Review', 'Selesai', 'Rejected')),
  citizen_name text not null,
  photo_url text,
  details text,
  assigned_team text,
  assigned_schedule text,
  notes text,
  task_assignment_status text default 'Available',
  reject_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Report Chats Table
create table public.report_chats (
  id uuid default gen_random_uuid() primary key,
  report_id text references public.reports(id) on delete cascade not null,
  sender text not null,
  text text not null,
  time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Teams Table
create table public.teams (
  name text primary key,
  members text[] not null,
  status text not null check (status in ('Available', 'Active', 'Offline')),
  current_task_id text references public.reports(id) on delete set null
);

-- 5. Create Projects Table (Community Projects)
create table public.projects (
  id text primary key,
  title text not null,
  location text not null,
  volunteers integer not null default 0,
  donated integer not null default 0,
  target integer not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Project Members Table (to track who joined which project)
create table public.project_members (
  project_id text references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (project_id, user_id)
);

-- 7. Create Proposals Table (Citizen Proposals)
create table public.proposals (
  id text primary key,
  title text not null,
  location text not null,
  description text not null,
  category text not null,
  proposer_name text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Volunteer Tasks Table
create table public.volunteer_tasks (
  id text primary key,
  location text not null,
  issue text not null,
  distance_km double precision not null,
  eta_min integer not null,
  payout integer not null,
  rating double precision not null,
  completed_tasks integer not null,
  status text not null check (status in ('available', 'accepted', 'uploaded', 'completed', 'claimed')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create User Vouchers Table (Redeem history)
create table public.user_vouchers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  voucher_id text not null,
  title text not null,
  code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create Transactions Table (Civic Points & Wallet)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('points', 'cash')),
  amount integer not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: Profile creation is handled directly in frontend client code upon registration,
-- so no database-level auth triggers are needed.

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_chats enable row level security;
alter table public.teams enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.proposals enable row level security;
alter table public.volunteer_tasks enable row level security;
alter table public.user_vouchers enable row level security;
alter table public.transactions enable row level security;

-- Create permissive RLS policies for easy prototyping
create policy "Allow full access to profiles" on public.profiles for all using (true) with check (true);
create policy "Allow full access to reports" on public.reports for all using (true) with check (true);
create policy "Allow full access to report_chats" on public.report_chats for all using (true) with check (true);
create policy "Allow full access to teams" on public.teams for all using (true) with check (true);
create policy "Allow full access to projects" on public.projects for all using (true) with check (true);
create policy "Allow full access to project_members" on public.project_members for all using (true) with check (true);
create policy "Allow full access to proposals" on public.proposals for all using (true) with check (true);
create policy "Allow full access to volunteer_tasks" on public.volunteer_tasks for all using (true) with check (true);
create policy "Allow full access to user_vouchers" on public.user_vouchers for all using (true) with check (true);
create policy "Allow full access to transactions" on public.transactions for all using (true) with check (true);

-- Seed Data: Teams
insert into public.teams (name, members, status) values
  ('Team A', array['Andi', 'Bayu', 'Candra'], 'Active'),
  ('Team B', array['Doni', 'Eko'], 'Available'),
  ('Team C', array['Faris', 'Guntur', 'Hadi'], 'Offline');

-- Seed Data: Projects
insert into public.projects (id, title, location, volunteers, donated, target, emoji) values
  ('p1', 'Pembersihan Kali Ciliwung', 'Kec. Beji, Depok', 47, 13000000, 20000000, '🌊'),
  ('p2', 'Pembersihan Kali Anggrek', 'Kec. Kemanggisan', 50, 15000000, 25000000, '🌊');

-- Seed Data: Reports
insert into public.reports (id, title, location, time, status, citizen_name, photo_url, details, assigned_team, assigned_schedule, notes, task_assignment_status) values
  ('10245', 'Sampah Berserakan', 'Jl. Anggrek', '2 jam lalu', 'New', 'David', '/images/trash_debris.png', 'Sampah plastik menumpuk di pinggir jalan raya mengganggu lalu lintas and mengeluarkan bau menyengat.', '', '', '', 'Available'),
  ('10246', 'Sampah Berserakan', 'Jl. Anggrek', '2 jam lalu', 'New', 'David', '/images/trash_debris.png', 'Tumpukan plastik belanjaan and styrofoam menyumbat saluran air di trotoar depan halte bus.', '', '', '', 'Available'),
  ('10247', 'Sampah Berserakan', 'Jl. Anggrek', '2 jam lalu', 'Processing', 'David', '/images/trash_debris.png', 'Puing-puing sisa konstruksi dibuang sembarangan di persimpangan jalan.', 'Team A', 'Schedule for Friday', 'Tim A sedang dalam perjalanan membawa truk pengangkut.', 'Available'),
  ('10248', 'Sampah Berserakan', 'Jl. Anggrek', '2 jam lalu', 'Needs Review', 'David', '/images/trash_debris.png', 'Sampah basah and botol kaca berserakan setelah pasar kaget bubar.', 'Team A', 'Schedule for Friday', 'Pembersihan selesai dilakukan. Menunggu verifikasi akhir dari pengawas wilayah.', 'Available'),
  ('10249', 'Daun Berserakan', 'Taman Anggrek', 'Kemarin', 'Selesai', 'David', '/images/trash_debris.png', 'Guguran daun kering menutupi area bermain anak-anak and taman hias.', 'Team B', 'Schedule for Yesterday', 'Masalah selesai diatasi dengan kerja bakti warga and bantuan petugas kebersihan dinas terkait.', 'Available'),
  ('10250', 'Lampu Jalan Mati', 'Jl. Melati', '5 jam lalu', 'New', 'Budi', '/images/trash_debris.png', 'Lampu penerangan utama jalan padam sepanjang 50 meter. Gelap gulita di malam hari.', '', '', '', 'Available');

-- Seed Data: Report Chats
insert into public.report_chats (report_id, sender, text, time) values
  ('10247', 'Staff David', 'Tim A sudah bersiap berangkat menuju lokasi.', '1 jam lalu'),
  ('10249', 'Staff David', 'Lokasi sudah bersih, silakan ditutup tiketnya.', 'Kemarin');

-- Seed Data: Proposals
insert into public.proposals (id, title, location, description, category, proposer_name, status) values
  ('prop1', 'Penanaman Pohon Teduh', 'Taman Hias Anggrek', 'Mengusulkan penanaman 20 pohon pelindung untuk mengurangi polusi udara and membuat taman bermain anak lebih rindang.', 'Greenery', 'Warga Budi', 'pending'),
  ('prop2', 'Kerja Bakti Cat Ulang JPO', 'Jl. Melati Raya', 'Jembatan penyebrangan orang (JPO) terlihat kusam and penuh coretan liar. Mengajak warga kerja bakti mengecat ulang.', 'Repair', 'David', 'pending');
