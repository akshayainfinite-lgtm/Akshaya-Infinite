-- Akshaya Infinite initial schema. Review and run in Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('owner','staff','customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 25),
  category text not null check (category in ('Ladies','Boys','Girls')),
  garment text not null,
  occasion text,
  timeline text,
  fabric_details text,
  customisation_details text not null,
  measurement_notes text,
  consent_to_contact boolean not null default false,
  status text not null default 'new_enquiry' check (status in ('new_enquiry','quote_sent','awaiting_payment','confirmed','cutting_stitching','quality_check','ready_for_delivery','completed','cancelled')),
  quoted_total numeric(12,2) check (quoted_total is null or quoted_total >= 0),
  quote_currency text not null default 'INR',
  payment_status text not null default 'not_paid' check (payment_status in ('not_paid','awaiting_confirmation','paid','refunded','not_applicable')),
  payment_method text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurement_profiles (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  profile_label text,
  category text not null check (category in ('Ladies','Boys','Girls')),
  unit text not null default 'cm' check (unit in ('cm','in')),
  measurements jsonb not null default '{}'::jsonb,
  fit_preference text,
  source text not null default 'manual' check (source in ('manual','ai_estimate','tailor_verified')),
  confidence jsonb,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  consent_recorded_at timestamptz,
  created_at timestamptz not null default now(),
  delete_after timestamptz
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  public_note text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null check (amount >= 0),
  is_customer_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_order_code_idx on public.orders(order_code);
create index if not exists measurement_profiles_order_idx on public.measurement_profiles(order_id);

create or replace function public.make_order_code()
returns trigger language plpgsql as $$
begin
  if new.order_code is null then
    new.order_code := 'AI-' || to_char(now() at time zone 'Asia/Kolkata','YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,8));
  end if;
  return new;
end; $$;

drop trigger if exists orders_make_code on public.orders;
create trigger orders_make_code before insert on public.orders
for each row execute function public.make_order_code();

create or replace function public.record_order_status_event()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events(order_id,status,public_note) values(new.id,new.status,'Enquiry received.');
  elsif new.status is distinct from old.status then
    insert into public.order_events(order_id,status,public_note)
    values(new.id,new.status,case new.status
      when 'quote_sent' then 'Quotation prepared.'
      when 'awaiting_payment' then 'Awaiting payment confirmation.'
      when 'confirmed' then 'Order confirmed.'
      when 'cutting_stitching' then 'Cutting and stitching in progress.'
      when 'quality_check' then 'Finishing and quality check in progress.'
      when 'ready_for_delivery' then 'Ready for delivery or collection.'
      when 'completed' then 'Order completed.'
      else 'Order status updated.' end);
  end if;
  return new;
end; $$;

drop trigger if exists orders_status_event on public.orders;
create trigger orders_status_event after insert or update of status on public.orders
for each row execute function public.record_order_status_event();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.measurement_profiles enable row level security;
alter table public.order_events enable row level security;
alter table public.quote_line_items enable row level security;

-- Profile: users can read their own profile. Only an existing owner may change roles.
create policy "profile self read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "owner profile read all" on public.profiles for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));
create policy "owner can manage profiles" on public.profiles for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- Public order submissions go through a validated server route using a server-only
-- service-role client. Do not grant anon SELECT or INSERT on orders directly.
create policy "staff owner read orders" on public.orders for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));
create policy "staff owner update orders" on public.orders for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));

create policy "staff owner manage measurements" on public.measurement_profiles for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));
create policy "staff owner read order events" on public.order_events for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));
create policy "staff owner insert order events" on public.order_events for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));
create policy "staff owner manage quote lines" on public.quote_line_items for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','staff')));

-- IMPORTANT:
-- Do not create public SELECT policies for orders or measurements.
-- The tracking API needs a dedicated server-side verification strategy before public launch.
-- Never put SUPABASE_SERVICE_ROLE_KEY in a NEXT_PUBLIC variable.
