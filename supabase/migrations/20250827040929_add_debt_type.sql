create type "public"."debt_type" as enum ('bad_debt', 'good_debt');

alter table "public"."debts" add column "type" debt_type not null default 'bad_debt'::debt_type;


