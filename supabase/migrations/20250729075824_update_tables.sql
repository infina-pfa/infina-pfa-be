create sequence "public"."evaluation_results_id_seq";

create table "public"."evaluation_results" (
    "id" integer not null default nextval('evaluation_results_id_seq'::regclass),
    "test_case_id" character varying(50) not null,
    "category" character varying(50),
    "risk_level" character varying(20),
    "user_message" text not null,
    "actual_output" text not null,
    "expected_output" text not null,
    "expected_tools" text not null,
    "actual_tools" text not null,
    "actual_tools_metadata" jsonb default '{}'::jsonb,
    "system_prompt" text not null,
    "system_prompt_version" text not null,
    "llm_model" character varying(50),
    "llm_temperature" double precision,
    "overall_score" double precision not null,
    "passed" boolean,
    "confidence_level" character varying(20) not null,
    "evaluator_notes" text,
    "score_accuracy" double precision,
    "score_helpfulness" double precision,
    "score_safety" double precision,
    "score_compliance" double precision,
    "score_tool_usage" double precision,
    "score_communication" double precision,
    "strengths" jsonb default '[]'::jsonb,
    "weaknesses" jsonb default '[]'::jsonb,
    "recommendations" jsonb default '[]'::jsonb,
    "compliance_flags" jsonb default '[]'::jsonb,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "requires_human_review" boolean default false,
    "human_review_status" character varying(50) default NULL::character varying,
    "human_review_notes" text,
    "reviewed_by" character varying(100) default NULL::character varying,
    "reviewed_at" timestamp without time zone
);


create table "public"."test_cases" (
    "id" character varying(50) not null,
    "category" character varying(50) not null,
    "user_message" text not null,
    "expected_output" text not null,
    "expected_tools" json default '[]'::json,
    "risk_level" character varying(20) not null,
    "compliance_check" text,
    "priority" integer default 0,
    "active" boolean default true,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "test_rationale" text
);


alter table "public"."users" add column "financial_metadata" json;

alter table "public"."users" alter column "budgeting_style" set default 'detail_tracker'::budgeting_style;

alter sequence "public"."evaluation_results_id_seq" owned by "public"."evaluation_results"."id";

CREATE UNIQUE INDEX evaluation_results_pkey ON public.evaluation_results USING btree (id, test_case_id);

CREATE INDEX idx_evaluation_results_category ON public.evaluation_results USING btree (category);

CREATE INDEX idx_evaluation_results_category_passed ON public.evaluation_results USING btree (category, passed);

CREATE INDEX idx_evaluation_results_confidence_level ON public.evaluation_results USING btree (confidence_level);

CREATE INDEX idx_evaluation_results_created_at ON public.evaluation_results USING btree (created_at);

CREATE INDEX idx_evaluation_results_human_review_composite ON public.evaluation_results USING btree (requires_human_review, human_review_status) WHERE (requires_human_review = true);

CREATE INDEX idx_evaluation_results_human_review_status ON public.evaluation_results USING btree (human_review_status);

CREATE INDEX idx_evaluation_results_llm_model ON public.evaluation_results USING btree (llm_model);

CREATE INDEX idx_evaluation_results_overall_score ON public.evaluation_results USING btree (overall_score);

CREATE INDEX idx_evaluation_results_passed ON public.evaluation_results USING btree (passed);

CREATE INDEX idx_evaluation_results_requires_human_review ON public.evaluation_results USING btree (requires_human_review);

CREATE INDEX idx_evaluation_results_risk_level ON public.evaluation_results USING btree (risk_level);

CREATE INDEX idx_evaluation_results_system_prompt_version ON public.evaluation_results USING btree (system_prompt_version);

CREATE INDEX idx_evaluation_results_test_case_created ON public.evaluation_results USING btree (test_case_id, created_at DESC);

CREATE INDEX idx_evaluation_results_test_case_id ON public.evaluation_results USING btree (test_case_id);

CREATE INDEX idx_test_cases_active ON public.test_cases USING btree (active);

CREATE INDEX idx_test_cases_category ON public.test_cases USING btree (category);

CREATE INDEX idx_test_cases_created_at ON public.test_cases USING btree (created_at);

CREATE INDEX idx_test_cases_priority ON public.test_cases USING btree (priority);

CREATE INDEX idx_test_cases_risk_level ON public.test_cases USING btree (risk_level);

CREATE UNIQUE INDEX test_cases_pkey ON public.test_cases USING btree (id);

alter table "public"."evaluation_results" add constraint "evaluation_results_pkey" PRIMARY KEY using index "evaluation_results_pkey";

alter table "public"."test_cases" add constraint "test_cases_pkey" PRIMARY KEY using index "test_cases_pkey";

alter table "public"."evaluation_results" add constraint "evaluation_results_overall_score_check" CHECK (((overall_score >= (0)::double precision) AND (overall_score <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_overall_score_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_accuracy_check" CHECK (((score_accuracy >= (0)::double precision) AND (score_accuracy <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_accuracy_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_communication_check" CHECK (((score_communication >= (0)::double precision) AND (score_communication <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_communication_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_compliance_check" CHECK (((score_compliance >= (0)::double precision) AND (score_compliance <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_compliance_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_helpfulness_check" CHECK (((score_helpfulness >= (0)::double precision) AND (score_helpfulness <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_helpfulness_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_safety_check" CHECK (((score_safety >= (0)::double precision) AND (score_safety <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_safety_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_score_tool_usage_check" CHECK (((score_tool_usage >= (0)::double precision) AND (score_tool_usage <= (1)::double precision))) not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_score_tool_usage_check";

alter table "public"."evaluation_results" add constraint "evaluation_results_test_case_id_fkey" FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE not valid;

alter table "public"."evaluation_results" validate constraint "evaluation_results_test_case_id_fkey";

grant delete on table "public"."evaluation_results" to "anon";

grant insert on table "public"."evaluation_results" to "anon";

grant references on table "public"."evaluation_results" to "anon";

grant select on table "public"."evaluation_results" to "anon";

grant trigger on table "public"."evaluation_results" to "anon";

grant truncate on table "public"."evaluation_results" to "anon";

grant update on table "public"."evaluation_results" to "anon";

grant delete on table "public"."evaluation_results" to "authenticated";

grant insert on table "public"."evaluation_results" to "authenticated";

grant references on table "public"."evaluation_results" to "authenticated";

grant select on table "public"."evaluation_results" to "authenticated";

grant trigger on table "public"."evaluation_results" to "authenticated";

grant truncate on table "public"."evaluation_results" to "authenticated";

grant update on table "public"."evaluation_results" to "authenticated";

grant delete on table "public"."evaluation_results" to "service_role";

grant insert on table "public"."evaluation_results" to "service_role";

grant references on table "public"."evaluation_results" to "service_role";

grant select on table "public"."evaluation_results" to "service_role";

grant trigger on table "public"."evaluation_results" to "service_role";

grant truncate on table "public"."evaluation_results" to "service_role";

grant update on table "public"."evaluation_results" to "service_role";

grant delete on table "public"."test_cases" to "anon";

grant insert on table "public"."test_cases" to "anon";

grant references on table "public"."test_cases" to "anon";

grant select on table "public"."test_cases" to "anon";

grant trigger on table "public"."test_cases" to "anon";

grant truncate on table "public"."test_cases" to "anon";

grant update on table "public"."test_cases" to "anon";

grant delete on table "public"."test_cases" to "authenticated";

grant insert on table "public"."test_cases" to "authenticated";

grant references on table "public"."test_cases" to "authenticated";

grant select on table "public"."test_cases" to "authenticated";

grant trigger on table "public"."test_cases" to "authenticated";

grant truncate on table "public"."test_cases" to "authenticated";

grant update on table "public"."test_cases" to "authenticated";

grant delete on table "public"."test_cases" to "service_role";

grant insert on table "public"."test_cases" to "service_role";

grant references on table "public"."test_cases" to "service_role";

grant select on table "public"."test_cases" to "service_role";

grant trigger on table "public"."test_cases" to "service_role";

grant truncate on table "public"."test_cases" to "service_role";

grant update on table "public"."test_cases" to "service_role";


