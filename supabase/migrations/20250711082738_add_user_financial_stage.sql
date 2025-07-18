

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."message_sender" AS ENUM (
    'ai',
    'user',
    'system'
);


ALTER TYPE "public"."message_sender" OWNER TO "postgres";


COMMENT ON TYPE "public"."message_sender" IS 'AI, User or System';



CREATE TYPE "public"."message_type" AS ENUM (
    'text',
    'image',
    'photo',
    'component',
    'tool'
);


ALTER TYPE "public"."message_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."message_type" IS 'text, image, component, tool, video';



CREATE TYPE "public"."transaction_type" AS ENUM (
    'income',
    'outcome',
    'transfer'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."transaction_type" IS 'income, outcome, transfer';



CREATE TYPE "public"."vector" AS (
	"values" double precision[]
);


ALTER TYPE "public"."vector" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."budget_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "budget_id" "uuid" NOT NULL,
    "transaction_id" "uuid" NOT NULL
);


ALTER TABLE "public"."budget_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."budget_transactions" IS 'all transactions of a budget';



CREATE TABLE IF NOT EXISTS "public"."budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#000000'::"text" NOT NULL,
    "icon" "text" DEFAULT 'other'::"text" NOT NULL,
    "category" "text" DEFAULT 'fixed'::"text" NOT NULL,
    "amount" numeric DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE "public"."budgets" OWNER TO "postgres";


COMMENT ON TABLE "public"."budgets" IS 'user budgets';



CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversations" IS 'user conversations';



CREATE TABLE IF NOT EXISTS "public"."debt_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "debt_id" "uuid" NOT NULL,
    "transaction_id" "uuid" NOT NULL
);


ALTER TABLE "public"."debt_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."debt_transactions" IS 'all transactions of a debt';



CREATE TABLE IF NOT EXISTS "public"."debts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone NOT NULL,
    "amount" numeric NOT NULL,
    "current_amount" numeric NOT NULL,
    "interest_rate" real DEFAULT '0'::real NOT NULL
);


ALTER TABLE "public"."debts" OWNER TO "postgres";


COMMENT ON TABLE "public"."debts" IS 'user debts';



CREATE TABLE IF NOT EXISTS "public"."goal_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."goal_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."goal_transactions" IS 'all transactions for a goal';



CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "due_date" timestamp with time zone,
    "description" "text",
    "current_amount" numeric DEFAULT '0'::numeric NOT NULL,
    "target_amount" numeric,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."goals" OWNER TO "postgres";


COMMENT ON TABLE "public"."goals" IS 'user goals';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "type" "public"."message_type" DEFAULT 'text'::"public"."message_type" NOT NULL,
    "sender" "public"."message_sender" DEFAULT 'user'::"public"."message_sender" NOT NULL,
    "metadata" json
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."messages" IS 'user messages';



CREATE TABLE IF NOT EXISTS "public"."onboarding_chat" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sender" "public"."message_sender" NOT NULL,
    "content" "text" NOT NULL,
    "component_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."onboarding_chat" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."onboarding_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "component_id" "text" NOT NULL,
    "response_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."onboarding_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" numeric NOT NULL,
    "recurring" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "public"."transaction_type" DEFAULT 'income'::"public"."transaction_type" NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'user transactions: income, expense, transfer';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_asset_value" numeric DEFAULT '0'::numeric NOT NULL,
    "onboarding_completed_at" timestamp with time zone,
    "financial_stage" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."debt_transactions"
    ADD CONSTRAINT "debt_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goal_transactions"
    ADD CONSTRAINT "goal_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_chat"
    ADD CONSTRAINT "onboarding_chat_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_profiles"
    ADD CONSTRAINT "onboarding_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_profiles"
    ADD CONSTRAINT "onboarding_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_user_id_component_id_key" UNIQUE ("user_id", "component_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_unique" UNIQUE ("user_id");



CREATE INDEX "idx_budget_transactions_budget_created" ON "public"."budget_transactions" USING "btree" ("budget_id", "created_at" DESC);



CREATE INDEX "idx_budget_transactions_budget_id" ON "public"."budget_transactions" USING "btree" ("budget_id");



CREATE INDEX "idx_budget_transactions_transaction_id" ON "public"."budget_transactions" USING "btree" ("transaction_id");



CREATE INDEX "idx_budget_transactions_user_id" ON "public"."budget_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_budgets_user_id" ON "public"."budgets" USING "btree" ("user_id");



CREATE INDEX "idx_budgets_user_month_year" ON "public"."budgets" USING "btree" ("user_id", "year", "month");



CREATE INDEX "idx_conversations_user_id" ON "public"."conversations" USING "btree" ("user_id");



CREATE INDEX "idx_debt_transactions_debt_created" ON "public"."debt_transactions" USING "btree" ("debt_id", "created_at" DESC);



CREATE INDEX "idx_debt_transactions_debt_id" ON "public"."debt_transactions" USING "btree" ("debt_id");



CREATE INDEX "idx_debt_transactions_transaction_id" ON "public"."debt_transactions" USING "btree" ("transaction_id");



CREATE INDEX "idx_debt_transactions_user_id" ON "public"."debt_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_debts_due_date" ON "public"."debts" USING "btree" ("due_date");



CREATE INDEX "idx_debts_user_id" ON "public"."debts" USING "btree" ("user_id");



CREATE INDEX "idx_goal_transactions_goal_created" ON "public"."goal_transactions" USING "btree" ("goal_id", "created_at" DESC);



CREATE INDEX "idx_goal_transactions_goal_id" ON "public"."goal_transactions" USING "btree" ("goal_id");



CREATE INDEX "idx_goal_transactions_transaction_id" ON "public"."goal_transactions" USING "btree" ("transaction_id");



CREATE INDEX "idx_goal_transactions_user_id" ON "public"."goal_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_goals_active" ON "public"."goals" USING "btree" ("user_id", "due_date") WHERE ("current_amount" < "target_amount");



CREATE INDEX "idx_goals_due_date" ON "public"."goals" USING "btree" ("due_date");



CREATE INDEX "idx_goals_user_id" ON "public"."goals" USING "btree" ("user_id");



CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_messages_conversation_id" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_sender_type" ON "public"."messages" USING "btree" ("sender", "type");



CREATE INDEX "idx_messages_user_id" ON "public"."messages" USING "btree" ("user_id");



CREATE INDEX "idx_onboarding_chat_conv_created" ON "public"."onboarding_chat" USING "btree" ("conversation_id", "created_at");



CREATE INDEX "idx_onboarding_profiles_completed" ON "public"."onboarding_profiles" USING "btree" ("is_completed");



CREATE INDEX "idx_onboarding_profiles_created_at" ON "public"."onboarding_profiles" USING "btree" ("created_at");



CREATE INDEX "idx_onboarding_profiles_user_id" ON "public"."onboarding_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_onboarding_responses_component_id" ON "public"."onboarding_responses" USING "btree" ("component_id");



CREATE INDEX "idx_onboarding_responses_created_at" ON "public"."onboarding_responses" USING "btree" ("created_at");



CREATE INDEX "idx_onboarding_responses_user_id" ON "public"."onboarding_responses" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_recurring" ON "public"."transactions" USING "btree" ("recurring") WHERE ("recurring" > 0);



CREATE INDEX "idx_transactions_type" ON "public"."transactions" USING "btree" ("type");



CREATE INDEX "idx_transactions_user_created" ON "public"."transactions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_user_type" ON "public"."transactions" USING "btree" ("user_id", "type");



CREATE INDEX "idx_users_user_id" ON "public"."users" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trg_onboarding_chat_updated" BEFORE UPDATE ON "public"."onboarding_chat" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_onboarding_profiles_updated_at" BEFORE UPDATE ON "public"."onboarding_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_onboarding_responses_updated_at" BEFORE UPDATE ON "public"."onboarding_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id");



ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");



ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."debt_transactions"
    ADD CONSTRAINT "debt_transactions_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id");



ALTER TABLE ONLY "public"."debt_transactions"
    ADD CONSTRAINT "debt_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");



ALTER TABLE ONLY "public"."debt_transactions"
    ADD CONSTRAINT "debt_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."goal_transactions"
    ADD CONSTRAINT "goal_transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id");



ALTER TABLE ONLY "public"."goal_transactions"
    ADD CONSTRAINT "goal_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");



ALTER TABLE ONLY "public"."goal_transactions"
    ADD CONSTRAINT "goal_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."onboarding_chat"
    ADD CONSTRAINT "onboarding_chat_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_chat"
    ADD CONSTRAINT "onboarding_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_profiles"
    ADD CONSTRAINT "onboarding_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Users can delete own onboarding chat" ON "public"."onboarding_chat" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own onboarding profile" ON "public"."onboarding_profiles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own onboarding responses" ON "public"."onboarding_responses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own onboarding chat" ON "public"."onboarding_chat" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own onboarding profile" ON "public"."onboarding_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own onboarding responses" ON "public"."onboarding_responses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own onboarding chat" ON "public"."onboarding_chat" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own onboarding profile" ON "public"."onboarding_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own onboarding responses" ON "public"."onboarding_responses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own onboarding chat" ON "public"."onboarding_chat" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own onboarding profile" ON "public"."onboarding_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own onboarding responses" ON "public"."onboarding_responses" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."budget_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "budget_transactions_delete_own" ON "public"."budget_transactions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budget_transactions_insert_own" ON "public"."budget_transactions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budget_transactions_select_own" ON "public"."budget_transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budget_transactions_update_own" ON "public"."budget_transactions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "budgets_delete_own" ON "public"."budgets" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budgets_insert_own" ON "public"."budgets" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budgets_select_own" ON "public"."budgets" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "budgets_update_own" ON "public"."budgets" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_delete_own" ON "public"."conversations" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "conversations_insert_own" ON "public"."conversations" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "conversations_select_own" ON "public"."conversations" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "conversations_update_own" ON "public"."conversations" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."debt_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "debt_transactions_delete_own" ON "public"."debt_transactions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debt_transactions_insert_own" ON "public"."debt_transactions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debt_transactions_select_own" ON "public"."debt_transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debt_transactions_update_own" ON "public"."debt_transactions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."debts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "debts_delete_own" ON "public"."debts" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debts_insert_own" ON "public"."debts" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debts_select_own" ON "public"."debts" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "debts_update_own" ON "public"."debts" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."goal_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "goal_transactions_delete_own" ON "public"."goal_transactions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goal_transactions_insert_own" ON "public"."goal_transactions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goal_transactions_select_own" ON "public"."goal_transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goal_transactions_update_own" ON "public"."goal_transactions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "goals_delete_own" ON "public"."goals" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goals_insert_own" ON "public"."goals" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goals_select_own" ON "public"."goals" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "goals_update_own" ON "public"."goals" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_delete_own" ON "public"."messages" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "messages_insert_own" ON "public"."messages" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "messages_select_own" ON "public"."messages" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "messages_update_own" ON "public"."messages" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."onboarding_chat" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "transactions_delete_own" ON "public"."transactions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transactions_insert_own" ON "public"."transactions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transactions_select_own" ON "public"."transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transactions_update_own" ON "public"."transactions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_own" ON "public"."users" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





















































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";






























GRANT ALL ON TABLE "public"."budget_transactions" TO "anon";
GRANT ALL ON TABLE "public"."budget_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."budget_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."budgets" TO "anon";
GRANT ALL ON TABLE "public"."budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."budgets" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."debt_transactions" TO "anon";
GRANT ALL ON TABLE "public"."debt_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."debt_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."debts" TO "anon";
GRANT ALL ON TABLE "public"."debts" TO "authenticated";
GRANT ALL ON TABLE "public"."debts" TO "service_role";



GRANT ALL ON TABLE "public"."goal_transactions" TO "anon";
GRANT ALL ON TABLE "public"."goal_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."goal_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_chat" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_chat" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_chat" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_profiles" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_responses" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

--
-- Dumped schema changes for auth and storage
--

