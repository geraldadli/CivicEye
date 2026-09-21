-- Operator accept -> completion report -> automatic payout flow.
alter table public.reports add column if not exists operator_id uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists operator_name text;
alter table public.reports add column if not exists proof_photo_url text;
