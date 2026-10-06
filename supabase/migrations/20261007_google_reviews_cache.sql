-- Persistent server-only review cache. One refresh lease per Google Place ID.
create table if not exists public.google_reviews_cache (
  place_id text primary key,
  payload jsonb,
  next_fetch_at timestamptz not null default now(),
  lease_until timestamptz not null default '-infinity',
  lease_token uuid
);
alter table public.google_reviews_cache enable row level security;
revoke all on public.google_reviews_cache from anon, authenticated;
grant all on public.google_reviews_cache to service_role;

create or replace function public.claim_google_reviews_refresh(p_place_id text, p_token uuid)
returns table(acquired boolean, payload jsonb)
language plpgsql security invoker set search_path = public as $$
declare claimed boolean;
begin
  insert into public.google_reviews_cache(place_id) values(p_place_id)
    on conflict (place_id) do nothing;
  update public.google_reviews_cache c
    set lease_token = p_token, lease_until = now() + interval '60 seconds'
    where c.place_id = p_place_id and c.next_fetch_at <= now() and c.lease_until <= now();
  claimed := found;
  return query select claimed, c.payload from public.google_reviews_cache c where c.place_id = p_place_id;
end;
$$;

create or replace function public.complete_google_reviews_refresh(p_place_id text, p_token uuid, p_payload jsonb)
returns void language sql security invoker set search_path = public as $$
  update public.google_reviews_cache
    set payload = coalesce(p_payload, payload),
        next_fetch_at = now() + case when p_payload is null then interval '1 hour' else interval '3 days' end,
        lease_until = '-infinity', lease_token = null
    where place_id = p_place_id and lease_token = p_token;
$$;
revoke all on function public.claim_google_reviews_refresh(text, uuid) from public, anon, authenticated;
revoke all on function public.complete_google_reviews_refresh(text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.claim_google_reviews_refresh(text, uuid) to service_role;
grant execute on function public.complete_google_reviews_refresh(text, uuid, jsonb) to service_role;
