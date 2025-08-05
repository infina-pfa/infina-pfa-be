drop index if exists "public"."idx_budgets_archived_at";

alter table "public"."budget_transactions" add column "deleted_at" timestamp with time zone;

alter table "public"."budgets" drop column "archived_at";

alter table "public"."budgets" add column "deleted_at" timestamp with time zone;

alter table "public"."conversations" add column "deleted_at" timestamp with time zone;

alter table "public"."goal_transactions" add column "deleted_at" timestamp with time zone;

alter table "public"."goals" add column "deleted_at" timestamp with time zone;

alter table "public"."messages" add column "deleted_at" timestamp with time zone;

alter table "public"."onboarding_messages" add column "deleted_at" timestamp with time zone;

alter table "public"."onboarding_profiles" add column "deleted_at" timestamp with time zone;

alter table "public"."transactions" add column "deleted_at" timestamp with time zone;

alter table "public"."users" add column "deleted_at" timestamp with time zone;

CREATE INDEX idx_budgets_archived_at ON public.budgets USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


