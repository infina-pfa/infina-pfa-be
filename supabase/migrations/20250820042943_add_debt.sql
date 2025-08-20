alter table "public"."transactions" alter column "type" drop default;

alter type "public"."transaction_type" rename to "transaction_type__old_version_to_be_dropped";

create type "public"."transaction_type" as enum ('income', 'budget_spending', 'goal_contribution', 'goal_withdrawal', 'debt_payment');

create table "public"."debt_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "debt_id" uuid not null,
    "transaction_id" uuid not null,
    "deleted_at" timestamp with time zone
);


alter table "public"."debt_transactions" enable row level security;

create table "public"."debts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "lender" text not null,
    "purpose" text not null,
    "amount" numeric not null,
    "deleted_at" timestamp with time zone,
    "rate" numeric not null,
    "due_date" timestamp with time zone not null
);


alter table "public"."debts" enable row level security;

alter table "public"."transactions" alter column type type "public"."transaction_type" using type::text::"public"."transaction_type";

alter table "public"."transactions" alter column "type" set default 'budget_spending'::transaction_type;

drop type "public"."transaction_type__old_version_to_be_dropped";

CREATE UNIQUE INDEX debt_transactions_pkey ON public.debt_transactions USING btree (id);

CREATE UNIQUE INDEX debts_pkey ON public.debts USING btree (id);

alter table "public"."debt_transactions" add constraint "debt_transactions_pkey" PRIMARY KEY using index "debt_transactions_pkey";

alter table "public"."debts" add constraint "debts_pkey" PRIMARY KEY using index "debts_pkey";

alter table "public"."debt_transactions" add constraint "debt_transactions_debt_id_fkey" FOREIGN KEY (debt_id) REFERENCES debts(id) not valid;

alter table "public"."debt_transactions" validate constraint "debt_transactions_debt_id_fkey";

alter table "public"."debt_transactions" add constraint "debt_transactions_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES transactions(id) not valid;

alter table "public"."debt_transactions" validate constraint "debt_transactions_transaction_id_fkey";

alter table "public"."debt_transactions" add constraint "debt_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."debt_transactions" validate constraint "debt_transactions_user_id_fkey";

alter table "public"."debts" add constraint "debts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."debts" validate constraint "debts_user_id_fkey";

grant delete on table "public"."debt_transactions" to "anon";

grant insert on table "public"."debt_transactions" to "anon";

grant references on table "public"."debt_transactions" to "anon";

grant select on table "public"."debt_transactions" to "anon";

grant trigger on table "public"."debt_transactions" to "anon";

grant truncate on table "public"."debt_transactions" to "anon";

grant update on table "public"."debt_transactions" to "anon";

grant delete on table "public"."debt_transactions" to "authenticated";

grant insert on table "public"."debt_transactions" to "authenticated";

grant references on table "public"."debt_transactions" to "authenticated";

grant select on table "public"."debt_transactions" to "authenticated";

grant trigger on table "public"."debt_transactions" to "authenticated";

grant truncate on table "public"."debt_transactions" to "authenticated";

grant update on table "public"."debt_transactions" to "authenticated";

grant delete on table "public"."debt_transactions" to "service_role";

grant insert on table "public"."debt_transactions" to "service_role";

grant references on table "public"."debt_transactions" to "service_role";

grant select on table "public"."debt_transactions" to "service_role";

grant trigger on table "public"."debt_transactions" to "service_role";

grant truncate on table "public"."debt_transactions" to "service_role";

grant update on table "public"."debt_transactions" to "service_role";

grant delete on table "public"."debts" to "anon";

grant insert on table "public"."debts" to "anon";

grant references on table "public"."debts" to "anon";

grant select on table "public"."debts" to "anon";

grant trigger on table "public"."debts" to "anon";

grant truncate on table "public"."debts" to "anon";

grant update on table "public"."debts" to "anon";

grant delete on table "public"."debts" to "authenticated";

grant insert on table "public"."debts" to "authenticated";

grant references on table "public"."debts" to "authenticated";

grant select on table "public"."debts" to "authenticated";

grant trigger on table "public"."debts" to "authenticated";

grant truncate on table "public"."debts" to "authenticated";

grant update on table "public"."debts" to "authenticated";

grant delete on table "public"."debts" to "service_role";

grant insert on table "public"."debts" to "service_role";

grant references on table "public"."debts" to "service_role";

grant select on table "public"."debts" to "service_role";

grant trigger on table "public"."debts" to "service_role";

grant truncate on table "public"."debts" to "service_role";

grant update on table "public"."debts" to "service_role";


