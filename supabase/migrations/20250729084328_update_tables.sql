drop trigger if exists "trg_onboarding_chat_updated" on "public"."onboarding_chat";

drop trigger if exists "update_onboarding_responses_updated_at" on "public"."onboarding_responses";

drop policy "debt_transactions_delete_own" on "public"."debt_transactions";

drop policy "debt_transactions_insert_own" on "public"."debt_transactions";

drop policy "debt_transactions_select_own" on "public"."debt_transactions";

drop policy "debt_transactions_update_own" on "public"."debt_transactions";

drop policy "debts_delete_own" on "public"."debts";

drop policy "debts_insert_own" on "public"."debts";

drop policy "debts_select_own" on "public"."debts";

drop policy "debts_update_own" on "public"."debts";

drop policy "Users can delete own onboarding chat" on "public"."onboarding_chat";

drop policy "Users can insert own onboarding chat" on "public"."onboarding_chat";

drop policy "Users can update own onboarding chat" on "public"."onboarding_chat";

drop policy "Users can view own onboarding chat" on "public"."onboarding_chat";

drop policy "Users can delete own onboarding responses" on "public"."onboarding_responses";

drop policy "Users can insert own onboarding responses" on "public"."onboarding_responses";

drop policy "Users can update own onboarding responses" on "public"."onboarding_responses";

drop policy "Users can view own onboarding responses" on "public"."onboarding_responses";

revoke delete on table "public"."debt_transactions" from "anon";

revoke insert on table "public"."debt_transactions" from "anon";

revoke references on table "public"."debt_transactions" from "anon";

revoke select on table "public"."debt_transactions" from "anon";

revoke trigger on table "public"."debt_transactions" from "anon";

revoke truncate on table "public"."debt_transactions" from "anon";

revoke update on table "public"."debt_transactions" from "anon";

revoke delete on table "public"."debt_transactions" from "authenticated";

revoke insert on table "public"."debt_transactions" from "authenticated";

revoke references on table "public"."debt_transactions" from "authenticated";

revoke select on table "public"."debt_transactions" from "authenticated";

revoke trigger on table "public"."debt_transactions" from "authenticated";

revoke truncate on table "public"."debt_transactions" from "authenticated";

revoke update on table "public"."debt_transactions" from "authenticated";

revoke delete on table "public"."debt_transactions" from "service_role";

revoke insert on table "public"."debt_transactions" from "service_role";

revoke references on table "public"."debt_transactions" from "service_role";

revoke select on table "public"."debt_transactions" from "service_role";

revoke trigger on table "public"."debt_transactions" from "service_role";

revoke truncate on table "public"."debt_transactions" from "service_role";

revoke update on table "public"."debt_transactions" from "service_role";

revoke delete on table "public"."debts" from "anon";

revoke insert on table "public"."debts" from "anon";

revoke references on table "public"."debts" from "anon";

revoke select on table "public"."debts" from "anon";

revoke trigger on table "public"."debts" from "anon";

revoke truncate on table "public"."debts" from "anon";

revoke update on table "public"."debts" from "anon";

revoke delete on table "public"."debts" from "authenticated";

revoke insert on table "public"."debts" from "authenticated";

revoke references on table "public"."debts" from "authenticated";

revoke select on table "public"."debts" from "authenticated";

revoke trigger on table "public"."debts" from "authenticated";

revoke truncate on table "public"."debts" from "authenticated";

revoke update on table "public"."debts" from "authenticated";

revoke delete on table "public"."debts" from "service_role";

revoke insert on table "public"."debts" from "service_role";

revoke references on table "public"."debts" from "service_role";

revoke select on table "public"."debts" from "service_role";

revoke trigger on table "public"."debts" from "service_role";

revoke truncate on table "public"."debts" from "service_role";

revoke update on table "public"."debts" from "service_role";

revoke delete on table "public"."evaluation_results" from "anon";

revoke insert on table "public"."evaluation_results" from "anon";

revoke references on table "public"."evaluation_results" from "anon";

revoke select on table "public"."evaluation_results" from "anon";

revoke trigger on table "public"."evaluation_results" from "anon";

revoke truncate on table "public"."evaluation_results" from "anon";

revoke update on table "public"."evaluation_results" from "anon";

revoke delete on table "public"."evaluation_results" from "authenticated";

revoke insert on table "public"."evaluation_results" from "authenticated";

revoke references on table "public"."evaluation_results" from "authenticated";

revoke select on table "public"."evaluation_results" from "authenticated";

revoke trigger on table "public"."evaluation_results" from "authenticated";

revoke truncate on table "public"."evaluation_results" from "authenticated";

revoke update on table "public"."evaluation_results" from "authenticated";

revoke delete on table "public"."evaluation_results" from "service_role";

revoke insert on table "public"."evaluation_results" from "service_role";

revoke references on table "public"."evaluation_results" from "service_role";

revoke select on table "public"."evaluation_results" from "service_role";

revoke trigger on table "public"."evaluation_results" from "service_role";

revoke truncate on table "public"."evaluation_results" from "service_role";

revoke update on table "public"."evaluation_results" from "service_role";

revoke delete on table "public"."onboarding_chat" from "anon";

revoke insert on table "public"."onboarding_chat" from "anon";

revoke references on table "public"."onboarding_chat" from "anon";

revoke select on table "public"."onboarding_chat" from "anon";

revoke trigger on table "public"."onboarding_chat" from "anon";

revoke truncate on table "public"."onboarding_chat" from "anon";

revoke update on table "public"."onboarding_chat" from "anon";

revoke delete on table "public"."onboarding_chat" from "authenticated";

revoke insert on table "public"."onboarding_chat" from "authenticated";

revoke references on table "public"."onboarding_chat" from "authenticated";

revoke select on table "public"."onboarding_chat" from "authenticated";

revoke trigger on table "public"."onboarding_chat" from "authenticated";

revoke truncate on table "public"."onboarding_chat" from "authenticated";

revoke update on table "public"."onboarding_chat" from "authenticated";

revoke delete on table "public"."onboarding_chat" from "service_role";

revoke insert on table "public"."onboarding_chat" from "service_role";

revoke references on table "public"."onboarding_chat" from "service_role";

revoke select on table "public"."onboarding_chat" from "service_role";

revoke trigger on table "public"."onboarding_chat" from "service_role";

revoke truncate on table "public"."onboarding_chat" from "service_role";

revoke update on table "public"."onboarding_chat" from "service_role";

revoke delete on table "public"."onboarding_responses" from "anon";

revoke insert on table "public"."onboarding_responses" from "anon";

revoke references on table "public"."onboarding_responses" from "anon";

revoke select on table "public"."onboarding_responses" from "anon";

revoke trigger on table "public"."onboarding_responses" from "anon";

revoke truncate on table "public"."onboarding_responses" from "anon";

revoke update on table "public"."onboarding_responses" from "anon";

revoke delete on table "public"."onboarding_responses" from "authenticated";

revoke insert on table "public"."onboarding_responses" from "authenticated";

revoke references on table "public"."onboarding_responses" from "authenticated";

revoke select on table "public"."onboarding_responses" from "authenticated";

revoke trigger on table "public"."onboarding_responses" from "authenticated";

revoke truncate on table "public"."onboarding_responses" from "authenticated";

revoke update on table "public"."onboarding_responses" from "authenticated";

revoke delete on table "public"."onboarding_responses" from "service_role";

revoke insert on table "public"."onboarding_responses" from "service_role";

revoke references on table "public"."onboarding_responses" from "service_role";

revoke select on table "public"."onboarding_responses" from "service_role";

revoke trigger on table "public"."onboarding_responses" from "service_role";

revoke truncate on table "public"."onboarding_responses" from "service_role";

revoke update on table "public"."onboarding_responses" from "service_role";

revoke delete on table "public"."test_cases" from "anon";

revoke insert on table "public"."test_cases" from "anon";

revoke references on table "public"."test_cases" from "anon";

revoke select on table "public"."test_cases" from "anon";

revoke trigger on table "public"."test_cases" from "anon";

revoke truncate on table "public"."test_cases" from "anon";

revoke update on table "public"."test_cases" from "anon";

revoke delete on table "public"."test_cases" from "authenticated";

revoke insert on table "public"."test_cases" from "authenticated";

revoke references on table "public"."test_cases" from "authenticated";

revoke select on table "public"."test_cases" from "authenticated";

revoke trigger on table "public"."test_cases" from "authenticated";

revoke truncate on table "public"."test_cases" from "authenticated";

revoke update on table "public"."test_cases" from "authenticated";

revoke delete on table "public"."test_cases" from "service_role";

revoke insert on table "public"."test_cases" from "service_role";

revoke references on table "public"."test_cases" from "service_role";

revoke select on table "public"."test_cases" from "service_role";

revoke trigger on table "public"."test_cases" from "service_role";

revoke truncate on table "public"."test_cases" from "service_role";

revoke update on table "public"."test_cases" from "service_role";

alter table "public"."debt_transactions" drop constraint "debt_transactions_debt_id_fkey";

alter table "public"."debt_transactions" drop constraint "debt_transactions_transaction_id_fkey";

alter table "public"."debt_transactions" drop constraint "debt_transactions_user_id_fkey";

alter table "public"."debts" drop constraint "debts_user_id_fkey";

alter table "public"."evaluation_results" drop constraint "evaluation_results_overall_score_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_accuracy_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_communication_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_compliance_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_helpfulness_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_safety_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_score_tool_usage_check";

alter table "public"."evaluation_results" drop constraint "evaluation_results_test_case_id_fkey";

alter table "public"."onboarding_chat" drop constraint "onboarding_chat_conversation_id_fkey";

alter table "public"."onboarding_chat" drop constraint "onboarding_chat_user_id_fkey";

alter table "public"."onboarding_responses" drop constraint "onboarding_responses_user_id_component_id_key";

alter table "public"."onboarding_responses" drop constraint "onboarding_responses_user_id_fkey";

alter table "public"."debt_transactions" drop constraint "debt_transactions_pkey";

alter table "public"."debts" drop constraint "debts_pkey";

alter table "public"."evaluation_results" drop constraint "evaluation_results_pkey";

alter table "public"."onboarding_chat" drop constraint "onboarding_chat_pkey";

alter table "public"."onboarding_responses" drop constraint "onboarding_responses_pkey";

alter table "public"."test_cases" drop constraint "test_cases_pkey";

drop index if exists "public"."debt_transactions_pkey";

drop index if exists "public"."debts_pkey";

drop index if exists "public"."evaluation_results_pkey";

drop index if exists "public"."idx_debt_transactions_debt_created";

drop index if exists "public"."idx_debt_transactions_debt_id";

drop index if exists "public"."idx_debt_transactions_transaction_id";

drop index if exists "public"."idx_debt_transactions_user_id";

drop index if exists "public"."idx_debts_due_date";

drop index if exists "public"."idx_debts_user_id";

drop index if exists "public"."idx_evaluation_results_category";

drop index if exists "public"."idx_evaluation_results_category_passed";

drop index if exists "public"."idx_evaluation_results_confidence_level";

drop index if exists "public"."idx_evaluation_results_created_at";

drop index if exists "public"."idx_evaluation_results_human_review_composite";

drop index if exists "public"."idx_evaluation_results_human_review_status";

drop index if exists "public"."idx_evaluation_results_llm_model";

drop index if exists "public"."idx_evaluation_results_overall_score";

drop index if exists "public"."idx_evaluation_results_passed";

drop index if exists "public"."idx_evaluation_results_requires_human_review";

drop index if exists "public"."idx_evaluation_results_risk_level";

drop index if exists "public"."idx_evaluation_results_system_prompt_version";

drop index if exists "public"."idx_evaluation_results_test_case_created";

drop index if exists "public"."idx_evaluation_results_test_case_id";

drop index if exists "public"."idx_onboarding_chat_conv_created";

drop index if exists "public"."idx_onboarding_responses_component_id";

drop index if exists "public"."idx_onboarding_responses_created_at";

drop index if exists "public"."idx_onboarding_responses_user_id";

drop index if exists "public"."idx_test_cases_active";

drop index if exists "public"."idx_test_cases_category";

drop index if exists "public"."idx_test_cases_created_at";

drop index if exists "public"."idx_test_cases_priority";

drop index if exists "public"."idx_test_cases_risk_level";

drop index if exists "public"."onboarding_responses_pkey";

drop index if exists "public"."onboarding_responses_user_id_component_id_key";

drop index if exists "public"."test_cases_pkey";

drop index if exists "public"."onboarding_chat_pkey";

drop table "public"."debt_transactions";

drop table "public"."debts";

drop table "public"."evaluation_results";

drop table "public"."onboarding_chat";

drop table "public"."onboarding_responses";

drop table "public"."test_cases";

create table "public"."onboarding_messages" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "sender" message_sender not null,
    "content" text not null,
    "component_id" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."onboarding_messages" enable row level security;

alter table "public"."users" drop column "budgeting_style";

alter table "public"."users" drop column "financial_metadata";

alter table "public"."users" drop column "total_asset_value";

drop sequence if exists "public"."evaluation_results_id_seq";

CREATE UNIQUE INDEX onboarding_chat_pkey ON public.onboarding_messages USING btree (id);

alter table "public"."onboarding_messages" add constraint "onboarding_chat_pkey" PRIMARY KEY using index "onboarding_chat_pkey";

alter table "public"."onboarding_messages" add constraint "onboarding_chat_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_messages" validate constraint "onboarding_chat_user_id_fkey";

grant delete on table "public"."onboarding_messages" to "anon";

grant insert on table "public"."onboarding_messages" to "anon";

grant references on table "public"."onboarding_messages" to "anon";

grant select on table "public"."onboarding_messages" to "anon";

grant trigger on table "public"."onboarding_messages" to "anon";

grant truncate on table "public"."onboarding_messages" to "anon";

grant update on table "public"."onboarding_messages" to "anon";

grant delete on table "public"."onboarding_messages" to "authenticated";

grant insert on table "public"."onboarding_messages" to "authenticated";

grant references on table "public"."onboarding_messages" to "authenticated";

grant select on table "public"."onboarding_messages" to "authenticated";

grant trigger on table "public"."onboarding_messages" to "authenticated";

grant truncate on table "public"."onboarding_messages" to "authenticated";

grant update on table "public"."onboarding_messages" to "authenticated";

grant delete on table "public"."onboarding_messages" to "service_role";

grant insert on table "public"."onboarding_messages" to "service_role";

grant references on table "public"."onboarding_messages" to "service_role";

grant select on table "public"."onboarding_messages" to "service_role";

grant trigger on table "public"."onboarding_messages" to "service_role";

grant truncate on table "public"."onboarding_messages" to "service_role";

grant update on table "public"."onboarding_messages" to "service_role";

create policy "Users can delete own onboarding chat"
on "public"."onboarding_messages"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own onboarding chat"
on "public"."onboarding_messages"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own onboarding chat"
on "public"."onboarding_messages"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own onboarding chat"
on "public"."onboarding_messages"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER trg_onboarding_chat_updated BEFORE UPDATE ON public.onboarding_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();


