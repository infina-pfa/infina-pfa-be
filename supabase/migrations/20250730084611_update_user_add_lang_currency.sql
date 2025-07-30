create type "public"."currency" as enum ('vnd', 'usd', 'eur');

create type "public"."financial_stage" as enum ('debt', 'start_saving', 'start_investing');

create type "public"."language" as enum ('vi', 'en');

alter table "public"."users" add column "currency" currency not null default 'vnd'::currency;

alter table "public"."users" add column "language" language not null default 'vi'::language;


