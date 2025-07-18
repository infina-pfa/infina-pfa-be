create type "public"."budgeting_style" as enum ('detail_tracker', 'goal_focused');

drop trigger if exists "update_memory_history_updated_at" on "public"."memory_history";

revoke delete on table "public"."memory_history" from "anon";

revoke insert on table "public"."memory_history" from "anon";

revoke references on table "public"."memory_history" from "anon";

revoke select on table "public"."memory_history" from "anon";

revoke trigger on table "public"."memory_history" from "anon";

revoke truncate on table "public"."memory_history" from "anon";

revoke update on table "public"."memory_history" from "anon";

revoke delete on table "public"."memory_history" from "authenticated";

revoke insert on table "public"."memory_history" from "authenticated";

revoke references on table "public"."memory_history" from "authenticated";

revoke select on table "public"."memory_history" from "authenticated";

revoke trigger on table "public"."memory_history" from "authenticated";

revoke truncate on table "public"."memory_history" from "authenticated";

revoke update on table "public"."memory_history" from "authenticated";

revoke delete on table "public"."memory_history" from "service_role";

revoke insert on table "public"."memory_history" from "service_role";

revoke references on table "public"."memory_history" from "service_role";

revoke select on table "public"."memory_history" from "service_role";

revoke trigger on table "public"."memory_history" from "service_role";

revoke truncate on table "public"."memory_history" from "service_role";

revoke update on table "public"."memory_history" from "service_role";

alter table "public"."memory_history" drop constraint "memory_history_pkey";

drop index if exists "public"."idx_memory_category";

drop index if exists "public"."idx_memory_created_at";

drop index if exists "public"."idx_memory_metadata";

drop index if exists "public"."idx_memory_updated_at";

drop index if exists "public"."idx_memory_user_id";

drop index if exists "public"."memory_history_pkey";

drop table "public"."memory_history";

alter table "public"."users" add column "budgeting_style" budgeting_style;


