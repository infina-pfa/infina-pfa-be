drop index if exists "public"."idx_transactions_type";

drop index if exists "public"."idx_transactions_user_type";

alter table "public"."transactions" alter column "type" drop default;

alter type "public"."transaction_type" rename to "transaction_type__old_version_to_be_dropped";

create type "public"."transaction_type" as enum ('income', 'budget_spending', 'goal_contribution', 'goal_withdrawal');

alter table "public"."transactions" alter column type type "public"."transaction_type" using type::text::"public"."transaction_type";

alter table "public"."transactions" alter column "type" set default 'income'::transaction_type;

drop type "public"."transaction_type__old_version_to_be_dropped";

alter table "public"."transactions" alter column "type" set default 'budget_spending'::transaction_type;


