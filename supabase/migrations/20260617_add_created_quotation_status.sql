-- Add 'created' status for finalized quotations (drafts stay as 'draft' and are hidden from the list).

alter table public.quotations
  drop constraint if exists quotations_status_check;

alter table public.quotations
  add constraint quotations_status_check
  check (status in ('draft', 'created', 'sent', 'accepted', 'rejected', 'expired'));