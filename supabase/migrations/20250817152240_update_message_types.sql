drop index if exists "public"."idx_messages_sender_type";

alter table "public"."messages" alter column "type" drop default;

alter type "public"."message_type" rename to "message_type__old_version_to_be_dropped";

create type "public"."message_type" as enum ('text', 'component', 'tool');

alter table "public"."messages" alter column type type "public"."message_type" using type::text::"public"."message_type";

alter table "public"."messages" alter column "type" set default 'text'::message_type;

drop type "public"."message_type__old_version_to_be_dropped";


