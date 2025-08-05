drop index if exists "public"."idx_onboarding_profiles_completed";

drop index if exists "public"."idx_onboarding_profiles_completed_at";

alter table "public"."onboarding_profiles" drop column "is_completed";

alter table "public"."onboarding_profiles" drop column "profile_data";

alter table "public"."onboarding_profiles" add column "metadata" jsonb;

alter table "public"."onboarding_profiles" add column "pyf_amount" numeric default '0'::numeric;

alter table "public"."users" drop column "onboarding_completed_at";


