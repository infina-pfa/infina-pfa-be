create extension if not exists "vector" with schema "extensions";


create type "public"."budgeting_style" as enum ('detail_tracker', 'goal_focused');

create type "public"."currency" as enum ('vnd', 'usd', 'eur');

create type "public"."financial_stage" as enum ('debt', 'start_saving', 'start_investing');

create type "public"."language" as enum ('vi', 'en');

create type "public"."message_sender" as enum ('ai', 'user', 'system');

create type "public"."message_type" as enum ('text', 'image', 'photo', 'component', 'tool');

create type "public"."transaction_type" as enum ('income', 'budget_spending', 'transfer');

create table "public"."budget_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "budget_id" uuid not null,
    "transaction_id" uuid not null
);


alter table "public"."budget_transactions" enable row level security;

create table "public"."budgets" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "month" integer not null,
    "year" integer not null,
    "name" text not null,
    "color" text not null default '#000000'::text,
    "icon" text not null default 'other'::text,
    "category" text not null default 'fixed'::text,
    "amount" numeric not null default '0'::numeric,
    "archived_at" timestamp with time zone
);


alter table "public"."budgets" enable row level security;

create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "name" text not null
);


alter table "public"."conversations" enable row level security;

create table "public"."goal_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "goal_id" uuid not null,
    "transaction_id" uuid not null,
    "user_id" uuid not null
);


alter table "public"."goal_transactions" enable row level security;

create table "public"."goals" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "title" text not null,
    "due_date" timestamp with time zone,
    "description" text,
    "current_amount" numeric not null default '0'::numeric,
    "target_amount" numeric,
    "user_id" uuid not null
);


alter table "public"."goals" enable row level security;

create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "conversation_id" uuid not null,
    "content" text not null,
    "type" message_type not null default 'text'::message_type,
    "sender" message_sender not null default 'user'::message_sender,
    "metadata" json
);


alter table "public"."messages" enable row level security;

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

create table "public"."onboarding_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "profile_data" jsonb not null default '{}'::jsonb,
    "is_completed" boolean default false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "expense" numeric,
    "income" numeric
);


alter table "public"."onboarding_profiles" enable row level security;

create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "amount" numeric not null,
    "recurring" integer not null,
    "name" text not null,
    "description" text,
    "type" transaction_type not null default 'income'::transaction_type,
    "user_id" uuid
);


alter table "public"."transactions" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "name" text not null,
    "user_id" uuid not null,
    "onboarding_completed_at" timestamp with time zone,
    "financial_stage" text,
    "language" language not null default 'vi'::language,
    "currency" currency not null default 'vnd'::currency
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX budget_transactions_pkey ON public.budget_transactions USING btree (id);

CREATE UNIQUE INDEX budgets_pkey ON public.budgets USING btree (id);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX goal_transactions_pkey ON public.goal_transactions USING btree (id);

CREATE UNIQUE INDEX goals_pkey ON public.goals USING btree (id);

CREATE INDEX idx_budget_transactions_budget_created ON public.budget_transactions USING btree (budget_id, created_at DESC);

CREATE INDEX idx_budget_transactions_budget_id ON public.budget_transactions USING btree (budget_id);

CREATE INDEX idx_budget_transactions_transaction_id ON public.budget_transactions USING btree (transaction_id);

CREATE INDEX idx_budget_transactions_user_id ON public.budget_transactions USING btree (user_id);

CREATE INDEX idx_budgets_user_id ON public.budgets USING btree (user_id);

CREATE INDEX idx_budgets_user_month_year ON public.budgets USING btree (user_id, year, month);

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);

CREATE INDEX idx_goal_transactions_goal_created ON public.goal_transactions USING btree (goal_id, created_at DESC);

CREATE INDEX idx_goal_transactions_goal_id ON public.goal_transactions USING btree (goal_id);

CREATE INDEX idx_goal_transactions_transaction_id ON public.goal_transactions USING btree (transaction_id);

CREATE INDEX idx_goal_transactions_user_id ON public.goal_transactions USING btree (user_id);

CREATE INDEX idx_goals_active ON public.goals USING btree (user_id, due_date) WHERE (current_amount < target_amount);

CREATE INDEX idx_goals_due_date ON public.goals USING btree (due_date);

CREATE INDEX idx_goals_user_id ON public.goals USING btree (user_id);

CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at DESC);

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_sender_type ON public.messages USING btree (sender, type);

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);

CREATE INDEX idx_onboarding_profiles_completed ON public.onboarding_profiles USING btree (is_completed);

CREATE INDEX idx_onboarding_profiles_created_at ON public.onboarding_profiles USING btree (created_at);

CREATE INDEX idx_onboarding_profiles_user_id ON public.onboarding_profiles USING btree (user_id);

CREATE INDEX idx_transactions_recurring ON public.transactions USING btree (recurring) WHERE (recurring > 0);

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);

CREATE INDEX idx_transactions_user_created ON public.transactions USING btree (user_id, created_at DESC);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE INDEX idx_transactions_user_type ON public.transactions USING btree (user_id, type);

CREATE INDEX idx_users_user_id ON public.users USING btree (user_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX onboarding_chat_pkey ON public.onboarding_messages USING btree (id);

CREATE UNIQUE INDEX onboarding_profiles_pkey ON public.onboarding_profiles USING btree (id);

CREATE UNIQUE INDEX onboarding_profiles_user_id_key ON public.onboarding_profiles USING btree (user_id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_user_id_unique ON public.users USING btree (user_id);

alter table "public"."budget_transactions" add constraint "budget_transactions_pkey" PRIMARY KEY using index "budget_transactions_pkey";

alter table "public"."budgets" add constraint "budgets_pkey" PRIMARY KEY using index "budgets_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."goal_transactions" add constraint "goal_transactions_pkey" PRIMARY KEY using index "goal_transactions_pkey";

alter table "public"."goals" add constraint "goals_pkey" PRIMARY KEY using index "goals_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."onboarding_messages" add constraint "onboarding_chat_pkey" PRIMARY KEY using index "onboarding_chat_pkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_pkey" PRIMARY KEY using index "onboarding_profiles_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."budget_transactions" add constraint "budget_transactions_budget_id_fkey" FOREIGN KEY (budget_id) REFERENCES budgets(id) not valid;

alter table "public"."budget_transactions" validate constraint "budget_transactions_budget_id_fkey";

alter table "public"."budget_transactions" add constraint "budget_transactions_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES transactions(id) not valid;

alter table "public"."budget_transactions" validate constraint "budget_transactions_transaction_id_fkey";

alter table "public"."budget_transactions" add constraint "budget_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."budget_transactions" validate constraint "budget_transactions_user_id_fkey";

alter table "public"."budgets" add constraint "budgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."budgets" validate constraint "budgets_user_id_fkey";

alter table "public"."conversations" add constraint "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."conversations" validate constraint "conversations_user_id_fkey";

alter table "public"."goal_transactions" add constraint "goal_transactions_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES goals(id) not valid;

alter table "public"."goal_transactions" validate constraint "goal_transactions_goal_id_fkey";

alter table "public"."goal_transactions" add constraint "goal_transactions_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES transactions(id) not valid;

alter table "public"."goal_transactions" validate constraint "goal_transactions_transaction_id_fkey";

alter table "public"."goal_transactions" add constraint "goal_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."goal_transactions" validate constraint "goal_transactions_user_id_fkey";

alter table "public"."goals" add constraint "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."goals" validate constraint "goals_user_id_fkey";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."onboarding_messages" add constraint "onboarding_chat_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_messages" validate constraint "onboarding_chat_user_id_fkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."onboarding_profiles" validate constraint "onboarding_profiles_user_id_fkey";

alter table "public"."onboarding_profiles" add constraint "onboarding_profiles_user_id_key" UNIQUE using index "onboarding_profiles_user_id_key";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."users" add constraint "users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_user_id_fkey";

alter table "public"."users" add constraint "users_user_id_unique" UNIQUE using index "users_user_id_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

create type "public"."vector" as ("values" double precision[]);

grant delete on table "public"."budget_transactions" to "anon";

grant insert on table "public"."budget_transactions" to "anon";

grant references on table "public"."budget_transactions" to "anon";

grant select on table "public"."budget_transactions" to "anon";

grant trigger on table "public"."budget_transactions" to "anon";

grant truncate on table "public"."budget_transactions" to "anon";

grant update on table "public"."budget_transactions" to "anon";

grant delete on table "public"."budget_transactions" to "authenticated";

grant insert on table "public"."budget_transactions" to "authenticated";

grant references on table "public"."budget_transactions" to "authenticated";

grant select on table "public"."budget_transactions" to "authenticated";

grant trigger on table "public"."budget_transactions" to "authenticated";

grant truncate on table "public"."budget_transactions" to "authenticated";

grant update on table "public"."budget_transactions" to "authenticated";

grant delete on table "public"."budget_transactions" to "service_role";

grant insert on table "public"."budget_transactions" to "service_role";

grant references on table "public"."budget_transactions" to "service_role";

grant select on table "public"."budget_transactions" to "service_role";

grant trigger on table "public"."budget_transactions" to "service_role";

grant truncate on table "public"."budget_transactions" to "service_role";

grant update on table "public"."budget_transactions" to "service_role";

grant delete on table "public"."budgets" to "anon";

grant insert on table "public"."budgets" to "anon";

grant references on table "public"."budgets" to "anon";

grant select on table "public"."budgets" to "anon";

grant trigger on table "public"."budgets" to "anon";

grant truncate on table "public"."budgets" to "anon";

grant update on table "public"."budgets" to "anon";

grant delete on table "public"."budgets" to "authenticated";

grant insert on table "public"."budgets" to "authenticated";

grant references on table "public"."budgets" to "authenticated";

grant select on table "public"."budgets" to "authenticated";

grant trigger on table "public"."budgets" to "authenticated";

grant truncate on table "public"."budgets" to "authenticated";

grant update on table "public"."budgets" to "authenticated";

grant delete on table "public"."budgets" to "service_role";

grant insert on table "public"."budgets" to "service_role";

grant references on table "public"."budgets" to "service_role";

grant select on table "public"."budgets" to "service_role";

grant trigger on table "public"."budgets" to "service_role";

grant truncate on table "public"."budgets" to "service_role";

grant update on table "public"."budgets" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."goal_transactions" to "anon";

grant insert on table "public"."goal_transactions" to "anon";

grant references on table "public"."goal_transactions" to "anon";

grant select on table "public"."goal_transactions" to "anon";

grant trigger on table "public"."goal_transactions" to "anon";

grant truncate on table "public"."goal_transactions" to "anon";

grant update on table "public"."goal_transactions" to "anon";

grant delete on table "public"."goal_transactions" to "authenticated";

grant insert on table "public"."goal_transactions" to "authenticated";

grant references on table "public"."goal_transactions" to "authenticated";

grant select on table "public"."goal_transactions" to "authenticated";

grant trigger on table "public"."goal_transactions" to "authenticated";

grant truncate on table "public"."goal_transactions" to "authenticated";

grant update on table "public"."goal_transactions" to "authenticated";

grant delete on table "public"."goal_transactions" to "service_role";

grant insert on table "public"."goal_transactions" to "service_role";

grant references on table "public"."goal_transactions" to "service_role";

grant select on table "public"."goal_transactions" to "service_role";

grant trigger on table "public"."goal_transactions" to "service_role";

grant truncate on table "public"."goal_transactions" to "service_role";

grant update on table "public"."goal_transactions" to "service_role";

grant delete on table "public"."goals" to "anon";

grant insert on table "public"."goals" to "anon";

grant references on table "public"."goals" to "anon";

grant select on table "public"."goals" to "anon";

grant trigger on table "public"."goals" to "anon";

grant truncate on table "public"."goals" to "anon";

grant update on table "public"."goals" to "anon";

grant delete on table "public"."goals" to "authenticated";

grant insert on table "public"."goals" to "authenticated";

grant references on table "public"."goals" to "authenticated";

grant select on table "public"."goals" to "authenticated";

grant trigger on table "public"."goals" to "authenticated";

grant truncate on table "public"."goals" to "authenticated";

grant update on table "public"."goals" to "authenticated";

grant delete on table "public"."goals" to "service_role";

grant insert on table "public"."goals" to "service_role";

grant references on table "public"."goals" to "service_role";

grant select on table "public"."goals" to "service_role";

grant trigger on table "public"."goals" to "service_role";

grant truncate on table "public"."goals" to "service_role";

grant update on table "public"."goals" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

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

grant delete on table "public"."onboarding_profiles" to "anon";

grant insert on table "public"."onboarding_profiles" to "anon";

grant references on table "public"."onboarding_profiles" to "anon";

grant select on table "public"."onboarding_profiles" to "anon";

grant trigger on table "public"."onboarding_profiles" to "anon";

grant truncate on table "public"."onboarding_profiles" to "anon";

grant update on table "public"."onboarding_profiles" to "anon";

grant delete on table "public"."onboarding_profiles" to "authenticated";

grant insert on table "public"."onboarding_profiles" to "authenticated";

grant references on table "public"."onboarding_profiles" to "authenticated";

grant select on table "public"."onboarding_profiles" to "authenticated";

grant trigger on table "public"."onboarding_profiles" to "authenticated";

grant truncate on table "public"."onboarding_profiles" to "authenticated";

grant update on table "public"."onboarding_profiles" to "authenticated";

grant delete on table "public"."onboarding_profiles" to "service_role";

grant insert on table "public"."onboarding_profiles" to "service_role";

grant references on table "public"."onboarding_profiles" to "service_role";

grant select on table "public"."onboarding_profiles" to "service_role";

grant trigger on table "public"."onboarding_profiles" to "service_role";

grant truncate on table "public"."onboarding_profiles" to "service_role";

grant update on table "public"."onboarding_profiles" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "budget_transactions_delete_own"
on "public"."budget_transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_insert_own"
on "public"."budget_transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_select_own"
on "public"."budget_transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budget_transactions_update_own"
on "public"."budget_transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_delete_own"
on "public"."budgets"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_insert_own"
on "public"."budgets"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_select_own"
on "public"."budgets"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "budgets_update_own"
on "public"."budgets"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_delete_own"
on "public"."conversations"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_insert_own"
on "public"."conversations"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_select_own"
on "public"."conversations"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "conversations_update_own"
on "public"."conversations"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_delete_own"
on "public"."goal_transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_insert_own"
on "public"."goal_transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_select_own"
on "public"."goal_transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goal_transactions_update_own"
on "public"."goal_transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_delete_own"
on "public"."goals"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_insert_own"
on "public"."goals"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_select_own"
on "public"."goals"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "goals_update_own"
on "public"."goals"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_delete_own"
on "public"."messages"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_insert_own"
on "public"."messages"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_select_own"
on "public"."messages"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "messages_update_own"
on "public"."messages"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


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


create policy "Users can delete own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own onboarding profile"
on "public"."onboarding_profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "transactions_delete_own"
on "public"."transactions"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_insert_own"
on "public"."transactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_select_own"
on "public"."transactions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "transactions_update_own"
on "public"."transactions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_insert_own"
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_select_own"
on "public"."users"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "users_update_own"
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER trg_onboarding_chat_updated BEFORE UPDATE ON public.onboarding_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER update_onboarding_profiles_updated_at BEFORE UPDATE ON public.onboarding_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


