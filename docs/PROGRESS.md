# Tamil AI Vanoli — Progress report

**Reviewed: 2026-10-25. Scope: checked-in implementation and local parser tests.**

## Executive status

The project is an integrated MVP foundation, not a production-safe automatic radio station. Listener and studio pages exist, and news, AI script and Sarvam calls are implemented. Successful hosted collection, paid-provider readiness, audio generation, cron execution and authenticated publishing were not verified in this review. No completion percentage is assigned because the critical release gates remain open.

## Milestones

| Milestone | Status | Evidence / qualification |
| --- | --- | --- |
| Listener and original show formats | Implemented | Home, shows, detail pages, schedule list, requests |
| Cloud data model and policies | Partial | Migrations and role policies exist; schema drift remains |
| News collection | Implemented, provider-dependent | RSS and NewsAPI; Firecrawl manually invoked |
| Parser regression suite | Verified locally | 10 passing tests; deployment gate not wired |
| Original Tamil script generation | Implemented, unverified live | Prompt rules and AI call; output validation missing |
| Sarvam speech | Partial | Provider calls/upload exist; byte assembly is unreliable |
| Sensitive-content approval | Partial / release-blocking | Category flags and RLS exist; explicit approval flow incomplete |
| Manual pipeline run | Implemented, unverified live | Show/city filters, max-news, skip-audio and result counts |
| Automatic scheduling | Scaffold only in repository | Hook and cron extensions; no persisted cron job |
| Production readiness | Not complete | Access, moderation, media and scheduling gates below |

## Current behavior

- “Live” plays a recent published episode, not a continuous schedule-driven station. Playback stops at episode end.
- Missing `audio_url` triggers silent simulated progress. Existing Skip, Like, Share and Volume controls do not have functional handlers; saving is absent.
- Source links appear at episode level, not individually linked to every factual script line.
- Admin shows inventory counts, not listener statistics, completion rate or popularity analytics.
- Source addition, voice edits, manual news, script previews and episode publish/reject controls exist. Full source editing, show creation, schedule editing and a dedicated moderation queue do not.
- Request submission inserts without a user ID. This fits the anonymous policy but can fail for signed-in users under the ownership policy.

## Release gaps, in priority order

### 1. Privileged endpoint access

The five existing integration functions have JWT verification disabled in configuration and no replacement caller/role checks in their handlers. They use privileged database access. The secret-protected cron hook does not secure direct function calls. Add endpoint-level authorization and a genuine studio session/role gate before release. Database policies alone do not cover these privileged operations.

### 2. Approval and private review media

Automated sensitivity detection checks exact normalized source-category strings only. It does not classify script content or unknown sensitive categories. Manual script saving does not assign sensitivity flags. The admin Publish control changes status/time but does not clear `requires_approval`, leaving flagged episodes hidden under the public-read policy even after publishing. Conversely, manual sensitive content can be published without a flag.

Speech can be generated before approval, and audio is uploaded to a public bucket. Hiding an episode row does not protect a known audio URL. Build one consistent explicit approve/reject transition and private review-media access before public release.

### 3. News eligibility and original summaries

Collection stores shortened feed/provider descriptions and a configured source score, not independently verified credibility. Deduplication hashes lowercase title plus URL; the index is not unique, so concurrent inserts can duplicate rows. There is no separate AI paraphrasing stage.

The pipeline selects the newest global news limit before filtering by city. It does not enforce approved status, prior use, show category or a freshness window. Firecrawl is manual, its domain check can be bypassed without source configuration, and suffix matching is too broad. Markdown fallback is clipped source text rather than guaranteed original wording. GDELT is not implemented.

### 4. Script validation

Prompt instructions request originality, neutral serious-news treatment and citations. They are not independent fact checking or moderation. Invalid JSON can become an error-shaped script in a successful response and be stored by automation. Add structured output validation, source-reference checks and independent moderation with fail-closed behavior.

### 5. Audio reliability

Sarvam bulbul:v2 is called per speaker/line. Encoded audio chunks are concatenated as bytes, without decoding or rebuilding WAV headers. Seamless full-episode audio has not been established. A single long sentence can exceed the intended chunk limit. Duration is estimated from bytes; generated voice direction is not applied.

No implemented music bed, jingle, effects mixer or MP3 rendering stage exists. Correct voice configuration also depends on resolving `speed` versus queried `pace`. Replace media assembly and test the complete file with a decoder and supported browser playback.

### 6. Scheduling and timeout recovery

The repository creates `pg_cron` and `pg_net` extensions but contains no scheduled job. Previously configured hosted jobs, if any, were not inspected. The pipeline reads shows, not schedule rows, and picks requested city, show city or Chennai; it does not fan out automatically across all six cities.

Bulk function calls default to skipping audio; selected-show calls default to audio. The admin panel explicitly sends its own checkbox value, initially false, so bulk admin runs can still request audio. The 120-second soft deadline only stops starting new work; it cannot cancel an in-flight provider call or guarantee avoidance of the 150-second idle timeout. Partial work can remain. Add queued jobs, request timeouts, retries, locking and idempotency rather than relying solely on the soft deadline.

### 7. Reproducible database setup

Checked-in migrations do not fully support fields queried by application code: source credibility score, the Firecrawl source type constraint and voice pace. One migration is empty. Hosted schema may differ, but it was not read in this task. Reconcile migrations before claiming fresh-install reproducibility.

## Verification record

**Executed:** `deno test supabase/functions/fetch-news/parser_test.ts` — **10 passed, 0 failed** on 2026-10-25.

Coverage: markup stripping, clipping, empty input, RSS 2.0, Atom links, missing fields/nullish fallbacks, malformed dates, CDATA, summary fallbacks and deterministic hashing.

**Not verified:** actual scheduled runs, hosted schema/roles, provider secrets/balances, unauthorized endpoint behavior, live generation, multi-segment audio decoding, authenticated approve/publish, or final audible replay. Parser coverage does not establish these outcomes.

## Next release acceptance checklist

- [ ] Anonymous/non-admin callers cannot invoke privileged production operations.
- [ ] Sensitive manual and automatic scripts cannot become public without explicit review.
- [ ] Approve clears the correct gate; reject prevents playback; review audio stays private.
- [ ] Clean migrations support every field/type queried by the application.
- [ ] Only eligible, sourced and city/show-relevant news reaches script generation.
- [ ] Invalid JSON, missing factual references and unsafe content fail closed.
- [ ] Multi-speaker audio decodes fully, has measured duration and plays audibly.
- [ ] Persisted schedule jobs honor time slots/cities and recover from timeouts without duplicates.
- [ ] Parser tests run before deployment; integration tests cover approval and publication.
- [ ] A real admin completes generate → review → publish and a listener hears the result.