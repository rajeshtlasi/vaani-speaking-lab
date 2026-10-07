# Vaani validation report

Date: 7 October 2026

## Passed

- Dependency installation completed.
- `npm run build`: TypeScript checks and Vite production compilation succeeded.
- `npm test`: 12 tests passed; zero failures.
- The Netlify coach function bundled with esbuild targeting Node 22.
- 150 unique lesson documents validated; all category counts match the initial brief.
- All dialogue, source and optional-audio fields pass content validation.
- Database schema executed successfully in PGlite (embedded PostgreSQL).
- Database tests confirmed private history isolation, rejection of cross-user inserts, protected administrator status, administrator-only publishing, and the atomic daily AI quota.
- DOM-simulated learner flow completed: lesson selection, typed answer, practice review, self-rating, save, progress, search, learning navigation, missing-microphone handling and dark mode.
- Missing-account-service state is explicit and does not simulate a successful sign-in.
- API guards and provider response validation were tested with controlled inputs; quota rejection occurred before any AI provider call.
- Bundled local Inter and Noto Sans Telugu fonts; custom favicon and picture-prompt asset are included.

## Not performed / not verified

- Real browser screenshots, visual layout at phone/desktop sizes, and actual 200% zoom inspection. The required browser-control skill was unavailable in this execution environment; no alternative browser-control workflow was used.
- Real microphone recording, real speech recognition, system text-to-speech voices, permission prompts and device compatibility. The automated microphone test covers the unavailable-device path only.
- Real Netlify build/deployment and public URL. No Netlify account was connected.
- Real Supabase sign-in email, network queries, sign-in redirects and admin publish against a hosted project. No Supabase project was supplied. The supplied SQL itself was executed and security-tested in PostgreSQL simulation.
- Live paid AI response quality, latency or multilingual evaluation. No API key or model was supplied.
- Browser WebMCP registration and execution. It is feature-detected; absence of support does not break the app.

This is a functional, build-tested application project prepared for configuration and deployment. These results do not establish that it is production-verified or ready for a student rollout without the live checks in README.md.
