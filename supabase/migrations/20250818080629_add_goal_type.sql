create type "public"."goal_type" as enum ('emergency', 'growth');

alter table "public"."goals" add column "type" goal_type not null default 'emergency'::goal_type;


