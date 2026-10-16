# Vaani — English for your next chapter

## Professional refinement · 16 October 2026

This update keeps the full 150-lesson Telugu-first curriculum and existing speaking exercises, while introducing:

- A forest-and-cream dashboard with an optimised campus illustration, clear actions and readable bilingual typography.
- Three complete learning paths: Everyday English (60 lessons), Career conversations (30), and Speak with confidence (30).
- A global Telugu/English lesson search, accessible dialogs, and Ctrl/Cmd+K shortcut.
- Curated lesson collections, a practical getting-started guide and a working 15-minute routine.
- Grouped desktop navigation, a mobile drawer, mobile quick navigation, light/dark appearance, and keyboard focus styles.
- Honest guest-session progress and clear messages for account or AI features that have not been configured.

The included Netlify functions and Supabase schema are preserved. The private Sites publication runs the frontend in guest mode. It does not run Netlify Functions. Accounts, cross-device progress, saved phrases and AI feedback need the services described below before student launch. Do not assume a configured AI backend from the appearance of the interface.

Automated verification: 15 tests pass, including learner review/save/progress, global search, path filtering, guide navigation, daily routine and the original security checks. Production TypeScript/Vite build passes. Live visual-browser, microphone, real account and live AI checks were unavailable and remain to be completed on real devices.

A React + TypeScript + Vite application for Telugu-speaking B.Tech students. Understand a real situation in Telugu, hear an English response, practise aloud, review, and repeat.

## Start here

1. Extract this project.
2. Install Node.js 22 or later.
3. Open a terminal inside `vaani`.
4. Run:

```bash
npm install
npm run dev
```

Use the local address printed by Vite. `npm run dev` serves the frontend; Netlify Functions run through Netlify Dev or a Netlify deployment.

```bash
npm test
npm run build
npm run preview
```

A prebuilt `dist/` is included for convenience. Use a local HTTP server to view it; opening `index.html` directly as a file will not correctly load the app. The checked-in lockfile supports reproducible installation with `npm ci`.

## What is implemented

- 150 original learning entries, validated against a typed schema.
- Telugu situations, starting answers, basic / natural / professional versions, Telugu explanations, objectives, listening and speaking practice.
- 20 Telugu-to-English lessons, 20 conversation situations, 20 natural expressions.
- 10 each: five-second challenges, stories, opinions, placement questions, group discussions, presentations, conversation rescue, pronunciation, and communication analysis.
- English text-to-speech using device/browser voices.
- Microphone recording, local playback, a waveform based on actual input levels, and live browser speech recognition where supported.
- A five-second response exercise that starts after microphone access is granted; response time is based on speech-start detection, not on clicking a button.
- Guided, multi-turn conversation prompts. These are authored exercises, not an open-ended live AI partner.
- AI transcript feedback through a protected Netlify Function, after service configuration.
- Clearly labelled non-AI practice review when AI is unavailable.
- 15-minute daily routine: 2-minute warm-up, 3-minute expressions, 3-minute conversation, 3-minute challenge, 2-minute review, 2-minute repeat.
- Six stages of thinking in English, including an original picture prompt.
- Confidence Gym, one-word answer expansion, conversation rescue, and context-appropriate expressions.
- Telugu and English search, difficulty filtering, and saved phrases for signed-in users.
- Real practice counts, recorded minutes, XP, streaks, self-rated confidence history, achievements, and repeat-practice history.
- Rule-based practice suggestions based on recent answer length, repeated “very”, candidate fillers, and response delay. It is not a trained adaptive-learning model.
- Email-link sign-in, account profiles, durable Supabase history, and owner-only saved phrases after configuration.
- Admin content creation and editing with database-enforced authorisation. Content includes situation, phrase, versions, explanation, audio URL, category, difficulty, dialogue, practice question, source and objective.
- Responsive styles, light/dark themes, semantic controls, Radix dialog/tab primitives, and a custom favicon.
- A feature-detected WebMCP `start_speaking_lesson` tool. It only navigates to a known lesson and never activates the microphone or saves an attempt.

## Important status

**The refined frontend is published privately with Sites. It is not deployed to your Netlify account.** No Supabase project, AI key or Netlify account was supplied.

Without configuration, students can explore all content, listen where device voices are available, record/play back where supported, type responses, receive practice review, and see temporary session progress. Guest progress is deliberately not presented as durable storage. Guest history is not automatically imported when signing in.

AI feedback and saved accounts require the setup below. Never paste service-role or AI keys into chat, source control, or browser code.

This version does not measure pronunciation accuracy, objective fluency, or psychological confidence. Text cannot establish these. It reports observable transcript/recording statistics and voluntary confidence self-ratings instead of invented percentages. Recorded duration includes silence; words per recorded minute is not a validated fluency score. Candidate filler words such as “like” may be meaningful rather than fillers.

The Star Lab has ten original communication exercises tied to three verified public-talk sources. It does not contain ten separate celebrity interviews, copied transcripts, or an endorsement by those speakers. Source interpretation is labelled; examples are original college-oriented sentences.

No live visual-browser or real microphone/voice QA was possible in the provided environment: the required browser-control skill was unavailable. Browser WebMCP validation was likewise unavailable. Complete the manual launch checks below before inviting students. Automated DOM tests are not a substitute for those checks.

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` once in its SQL editor. This is an initial migration for a **new** project, not a destructive reset script.
3. Copy `.env.example` to `.env` locally.
4. Set the project's URL and public anon key in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The public key is safe only with the included row-level security policies applied.
5. Also set `SUPABASE_URL` and `SUPABASE_ANON_KEY` for server functions.
6. In Supabase Auth URL configuration, set the actual website URL and the allowed redirect URLs. For local testing, add the exact local origin you use. Enable email-link authentication and configure production email delivery for real users.
7. Sign in once to create your profile.
8. To make your account an administrator, use the Supabase SQL editor as project owner:

```sql
update public.profiles
set is_admin = true
where id = 'YOUR_AUTH_USER_UUID';
```

Use your own exact user UUID from Supabase Auth. The browser cannot update `is_admin`; normal users can change only `display_name` and `level`.

Optional: populate the database with the original content. Built-in content already appears without seeding. Add the service-role key **only to your local `.env`**, then run:

```bash
npm run seed
```

The seed script inserts missing lessons without replacing existing customisations. The service-role key is not needed by the deployed frontend or coach function. Do not set a `VITE_` service-role variable.

`lessons.content` is the canonical lesson document. Additional relational tables provide space for future normalisation of expressions, situations, conversations, questions, video sources and more. `auth.users` is the users table. Current attempt feedback is stored atomically in `speaking_attempts.feedback`; additional `ai_feedback`, `progress`, `achievements`, `mistake_history` tables are extension points, not falsely represented as already populated. Current stats and achievements derive from saved attempts.

## Configure the AI coach

Set these **server-only** variables in Netlify:

```text
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=<your provider key>
AI_MODEL=<a model available to your account>
SUPABASE_URL=<your project URL>
SUPABASE_ANON_KEY=<your public anon key>
```

The provider abstraction is in `netlify/lib/provider.ts`. The supplied adapter expects an HTTPS OpenAI-compatible `/chat/completions` endpoint with JSON-object output and the `max_tokens` parameter. If your chosen model/provider uses a different protocol, add another `CoachProvider` implementation. No model or price is assumed.

The function verifies the Supabase access token, validates and limits input, consumes an atomic quota (30 review requests per user per UTC day), calls the provider, and validates the returned JSON. The quota is consumed even when a provider request fails, to prevent repeated abusive upstream calls. Only transcript, prompt and model answer go to the AI service. Audio recordings are not uploaded or stored by this app.

For local full-stack testing after installing Netlify CLI:

```bash
npx netlify dev
```

Set the values locally or through the Netlify environment. `npm run dev` alone does not run the function. The UI keeps the learner's answer when the coach is unavailable.

## Deploy to Netlify

1. Put this project's source in your own Git repository (do not commit `.env`).
2. Connect the repository to your Netlify account and select the folder containing `package.json` as the base directory.
3. Use the included `netlify.toml`: build command `npm run build`, publish directory `dist`, functions directory `netlify/functions`, Node 22.
4. Add the two `VITE_SUPABASE_*` build variables, the server Supabase variables, and the AI variables above. All `VITE_` values become public client code; never put private secrets there.
5. Deploy. Add the resulting HTTPS URL to Supabase Auth's site/redirect configuration.
6. Complete the live checks below. If changing Vite build variables, trigger a new build.

Do not deploy only the `dist` folder and expect the AI coach to work: the Netlify Function must be included in the deployment. No live site URL is claimed in this delivery.

The included CSP allows the standard `*.supabase.co` host. If you use a custom Supabase domain, explicitly add that trusted domain to `connect-src` in `netlify.toml`. Source videos open on their original sites instead of being embedded.

## Student journey

1. Open My Practice and choose “ఇప్పుడే మాట్లాడండి”.
2. To learn first, choose the understanding tab and listen to the examples.
3. Tap the microphone, allow access, speak, then stop. Some browser recognition services process audio remotely; the interface explains this before recording.
4. Listen to your own recording. Check the transcript and correct recognition errors.
5. Choose AI feedback (configured/sign-in required) or Practice review.
6. Optionally self-rate comfort from 1–5. Save the attempt.
7. Repeat with the model hidden. Save the new attempt to compare later.
8. My Progress shows actual saved attempts. Saved phrases are available through the bookmark button.

## Admin journey

Sign in with an authorised admin account, then open **Content admin** in the footer. Choose an existing lesson or create a new one, fill the bilingual lesson fields and optional source/audio details, and publish. Authorisation is enforced by Supabase policies, not only by hiding the form. Publishing cannot be tested end-to-end until a real Supabase project is configured.

## Validation

Automated tests cover:

- 150 unique lesson documents, schema validity and all requested counts.
- Telugu search and natural English phrases.
- Honest fallback feedback and progress calculations.
- API method, content-type, authentication, input-size and provider configuration guards.
- Provider JSON validation and quota enforcement before AI calls.
- Executing the Supabase SQL in an embedded PostgreSQL engine, verifying user isolation, protected admin roles, admin-only publishing and the 30-review limit.
- A learner journey in a simulated DOM: choose prompt, type, review, self-rate, save, inspect progress, search, navigate learning modules, handle unavailable microphone, and change theme.
- Account dialog behaviour with services unconfigured.

Run `npm test` and `npm run build` after changes. See `TEST_REPORT.md` for delivered run results and boundaries.

Before student launch, check on a real laptop and phone:

- 390px and desktop layouts, long Telugu text, keyboard navigation, 200% text enlargement, dark mode and dialog focus.
- Allow/deny microphone, record/stop/replay, recognition supported/unsupported, speech-start countdown, network interruption and a three-minute session.
- Sign-in email delivery, redirect back, sign-out, reload persistence, and isolation across two accounts.
- Admin publish and non-admin rejection against the actual Supabase service.
- AI success, expired token, missing/invalid key, exhausted quota, timeout and retry without losing the answer.
- Teacher review of Telugu explanations and pronunciation examples.

## Sources and attribution

Communication lab source links (examples in the app are original teaching material):

- Shah Rukh Khan, TED, “Thoughts on humanity, fame and love”: https://www.ted.com/talks/shah_rukh_khan_thoughts_on_humanity_fame_and_love
- Julian Treasure, TED, “How to speak so that people want to listen”: https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen
- Chimamanda Ngozi Adichie, TED-Ed, “The danger of a single story”: https://ed.ted.com/lessons/TXtMhXIA

The library photo in `public/campus-speaking-practice.png` was generated specifically for the picture-to-English exercise. It is illustrative, not a photograph of real enrolled students. Lucide icons and Radix UI retain their package licences. Inter and Noto Sans Telugu are bundled locally; their SIL Open Font Licenses are included in `licenses/`.

Reference documentation:

- Netlify Functions: https://docs.netlify.com/build/functions/api/
- Netlify functions setup: https://docs.netlify.com/build/functions/get-started/
- Supabase email-link authentication: https://supabase.com/docs/guides/auth/auth-email-passwordless

## Project map

```text
src/App.tsx                 Main learning workspace, search, guide and admin UI
src/Dashboard.tsx           Refined dashboard, learning paths and collections
src/refinement.css          Professional responsive visual system
src/Speaker.tsx             Recording, speech-to-text, playback and review
src/content.ts              Typed curriculum and 150 initial entries
src/learning.ts             Transparent metrics and practice suggestions
src/services.ts             Supabase and coach client operations
src/style.css               Responsive bilingual light/dark design
netlify/functions/coach.ts  Protected AI endpoint
netlify/lib/provider.ts     AI provider abstraction and result validation
supabase/schema.sql        Initial database schema, roles and policies
scripts/seed.ts             Safe initial content seeding
netlify.toml               Build, functions, SPA fallback and headers
tests/                     Content, logic, simulated UI and security tests
```
