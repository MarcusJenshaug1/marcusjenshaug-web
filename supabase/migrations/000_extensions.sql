-- pg_cron må aktiveres i Supabase Dashboard → Extensions før denne kjøres.
-- Uten aktivering feiler `create extension` med "could not open extension control file".

create extension if not exists pg_cron;
