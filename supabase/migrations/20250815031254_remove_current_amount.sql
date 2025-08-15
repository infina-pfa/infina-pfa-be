drop index if exists "public"."idx_goals_active";

drop index if exists "public"."idx_goals_user_amount";

alter table "public"."goals" drop column "current_amount";


