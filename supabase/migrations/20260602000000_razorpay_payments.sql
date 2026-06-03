alter table public.bookings
  drop column if exists paid_amount,
  drop column if exists remaining_amount;

alter table public.payments
  drop column if exists installment_number,
  drop column if exists screenshot_url,
  drop column if exists utr,
  drop column if exists verification_notes,
  drop column if exists verified,
  drop column if exists verified_by;

alter table public.payments
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text,
  add column if not exists gateway_fee numeric,
  add column if not exists status text not null default 'created';

alter table public.payments
  alter column payment_method set default 'razorpay';

create unique index if not exists payments_booking_id_key on public.payments (booking_id);
create unique index if not exists payments_razorpay_order_id_key
  on public.payments (razorpay_order_id)
  where razorpay_order_id is not null;
create unique index if not exists payments_razorpay_payment_id_key
  on public.payments (razorpay_payment_id)
  where razorpay_payment_id is not null;
create unique index if not exists bookings_booking_reference_key on public.bookings (booking_reference);

update public.bookings
set status = 'payment_pending'
where status in ('pending', 'verified', 'rejected', 'confirmed');

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('payment_pending', 'paid', 'cancelled', 'completed'));

alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('created', 'captured', 'failed', 'refunded'));

create table if not exists public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.mark_booking_paid_and_decrement_seats(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_remaining_seats integer;
begin
  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'paid' then
    return;
  end if;

  select remaining_seats
  into v_remaining_seats
  from public.travel_packages
  where id = v_booking.package_id
  for update;

  if not found then
    raise exception 'Travel package not found';
  end if;

  if v_remaining_seats < v_booking.traveler_count then
    raise exception 'Not enough seats available';
  end if;

  update public.travel_packages
  set remaining_seats = remaining_seats - v_booking.traveler_count
  where id = v_booking.package_id;

  update public.bookings
  set status = 'paid'
  where id = p_booking_id;
end;
$$;

create or replace function public.capture_booking_payment(
  p_booking_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text default null,
  p_payment_method text default 'razorpay',
  p_gateway_fee numeric default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_payment record;
  v_remaining_seats integer;
begin
  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'paid' then
    return;
  end if;

  select *
  into v_payment
  from public.payments
  where booking_id = p_booking_id
    and razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'Payment order not found for booking';
  end if;

  if v_payment.status = 'captured' then
    return;
  end if;

  select remaining_seats
  into v_remaining_seats
  from public.travel_packages
  where id = v_booking.package_id
  for update;

  if not found then
    raise exception 'Travel package not found';
  end if;

  if v_remaining_seats < v_booking.traveler_count then
    raise exception 'Not enough seats available';
  end if;

  update public.payments
  set
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = coalesce(p_razorpay_signature, razorpay_signature),
    payment_method = coalesce(p_payment_method, payment_method),
    gateway_fee = coalesce(p_gateway_fee, gateway_fee),
    status = 'captured'
  where id = v_payment.id;

  update public.travel_packages
  set remaining_seats = remaining_seats - v_booking.traveler_count
  where id = v_booking.package_id;

  update public.bookings
  set status = 'paid'
  where id = p_booking_id;
end;
$$;
