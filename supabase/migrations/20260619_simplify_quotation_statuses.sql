update public.quotations
set status = 'created'
where status in ('sent', 'accepted');

alter table public.quotations
  drop constraint if exists quotations_status_check;

alter table public.quotations
  add constraint quotations_status_check
  check (
    status in (
      'draft',
      'created',
      'rejected',
      'expired',
      'in_progress',
      'completed'
    )
  );