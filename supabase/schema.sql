-- Run once on a NEW Supabase project. Keep future schema changes as new migrations.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Learner' check(char_length(display_name) between 1 and 50),
 level text not null default 'Starter' check(level in ('Starter','Building','Confident')),
 is_admin boolean not null default false,
 created_at timestamptz not null default now()
);
create function public.on_user_created() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;
create trigger create_profile after insert on auth.users for each row execute function public.on_user_created();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select coalesce((select is_admin from public.profiles where id=auth.uid()),false); $$;
revoke all on function public.is_admin() from public;grant execute on function public.is_admin() to anon,authenticated;
alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid());
create policy profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;grant update(display_name,level) on public.profiles to authenticated;
-- Never grant is_admin updates to the browser. Assign admins using SQL as project owner.
create table public.lessons(id text primary key,content jsonb not null check(jsonb_typeof(content)='object'),published boolean not null default true,created_at timestamptz not null default now());
alter table public.lessons enable row level security;
create policy lesson_read on public.lessons for select to anon,authenticated using(published or public.is_admin());
create policy lesson_admin on public.lessons for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select on public.lessons to anon;grant select,insert,update,delete on public.lessons to authenticated;
create table public.speaking_attempts(
 id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null,transcript text not null check(char_length(transcript) between 3 and 6000),
 duration_seconds integer not null default 0 check(duration_seconds between 0 and 180),
 response_ms integer check(response_ms between 0 and 180000),input_mode text not null check(input_mode in('typed','speech')),
 confidence integer check(confidence between 1 and 5),feedback jsonb,created_at timestamptz not null default now()
);
create index attempts_user_date on public.speaking_attempts(user_id,created_at desc);
alter table public.speaking_attempts enable row level security;
create policy attempts_read on public.speaking_attempts for select to authenticated using(user_id=auth.uid());
create policy attempts_insert on public.speaking_attempts for insert to authenticated with check(user_id=auth.uid());
create policy attempts_delete on public.speaking_attempts for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.speaking_attempts to authenticated;
create table public.saved_phrases(user_id uuid references auth.users(id) on delete cascade,lesson_id text,created_at timestamptz not null default now(),primary key(user_id,lesson_id));
alter table public.saved_phrases enable row level security;
create policy saved_owner on public.saved_phrases for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,delete on public.saved_phrases to authenticated;
-- Atomic server-enforced daily quota; client cannot reset or write quota rows.
create table public.coach_quota(user_id uuid references auth.users(id) on delete cascade,day date,calls integer not null default 0,primary key(user_id,day));
alter table public.coach_quota enable row level security;
revoke all on public.coach_quota from anon,authenticated;
create function public.consume_coach_quota() returns boolean language plpgsql security definer set search_path=public as $$
declare consumed integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.coach_quota(user_id,day,calls) values(auth.uid(),(now() at time zone 'UTC')::date,1)
 on conflict(user_id,day) do update set calls=coach_quota.calls+1 where coach_quota.calls<30 returning calls into consumed;
 return consumed is not null;
end; $$;
revoke all on function public.consume_coach_quota() from public;grant execute on function public.consume_coach_quota() to authenticated;
-- Extensions for a larger content catalogue; lesson content is the canonical UI document.
create table public.levels(id text primary key,name text not null,ordinal integer not null);
insert into public.levels values('starter','Starter',1),('building','Building',2),('confident','Confident',3);
create table public.expressions(id uuid primary key default gen_random_uuid(),lesson_id text references public.lessons(id) on delete cascade,phrase text not null,context text);
create table public.telugu_phrases(id uuid primary key default gen_random_uuid(),lesson_id text references public.lessons(id) on delete cascade,phrase text not null,meaning text);
create table public.situations(id uuid primary key default gen_random_uuid(),lesson_id text references public.lessons(id) on delete cascade,description text not null);
create table public.conversations(id uuid primary key default gen_random_uuid(),lesson_id text references public.lessons(id) on delete cascade,turns jsonb not null default '[]');
create table public.questions(id uuid primary key default gen_random_uuid(),lesson_id text references public.lessons(id) on delete cascade,prompt text not null);
create table public.video_sources(id uuid primary key default gen_random_uuid(),url text not null,speaker text,title text,license_notes text);
create table public.videos(id uuid primary key default gen_random_uuid(),source_id uuid references public.video_sources(id),lesson_id text references public.lessons(id) on delete cascade,analysis jsonb);
create table public.daily_challenges(id uuid primary key default gen_random_uuid(),day date not null,lesson_id text references public.lessons(id),objective text);
create table public.answers(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,question_id uuid references public.questions(id),text text not null);
create table public.ai_feedback(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,attempt_id uuid references public.speaking_attempts(id) on delete cascade,content jsonb not null);
create table public.progress(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,lesson_id text,completed_at timestamptz not null default now());
create table public.achievements(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,code text not null,earned_at timestamptz not null default now(),unique(user_id,code));
create table public.mistake_history(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,attempt_id uuid references public.speaking_attempts(id) on delete cascade,kind text not null,note text,created_at timestamptz default now());
-- Supporting tables are prepared for later normalization; attempts currently store feedback atomically.
do $$ declare t text; begin
 foreach t in array array['levels','expressions','telugu_phrases','situations','conversations','questions','video_sources','videos','daily_challenges'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy catalog_read on public.%I for select to anon,authenticated using(true)',t);
 execute format('create policy catalog_admin on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 execute format('grant select on public.%I to anon',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
 foreach t in array array['answers','ai_feedback','progress','achievements','mistake_history'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy owner_data on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
end; $$;
commit;
