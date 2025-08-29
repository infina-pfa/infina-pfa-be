alter table "public"."onboarding_profiles" add column "session_id" uuid not null default gen_random_uuid();


