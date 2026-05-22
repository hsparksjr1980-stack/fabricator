# Fabricator Build Progress Changelog

This file tracks the major product, design, architecture, and implementation changes made during the current Fabricator MVP build cycle.

## Product Direction

Fabricator was repositioned from a basic project tracker into a premium industrial builder operating system.

Current product identity:
- AI-assisted builder workspace
- fabrication project memory system
- premium workshop journal
- operational dashboard for hands-on builders
- voice-driven build intelligence layer

Target project types:
- metal fabrication
- woodworking
- restoration
- race builds
- custom vehicles
- motorcycle builds
- creator projects

## Visual / UX Direction

The app was redesigned around a cinematic workshop aesthetic.

Implemented visual language:
- matte charcoal surfaces
- graphite and steel panels
- ember-orange highlights
- layered depth
- premium industrial cards
- cinematic hero sections
- photo-first documentation
- floating workshop navigation dock
- heavier industrial typography
- workshop-oriented operational hierarchy

Avoided direction:
- generic SaaS
- gamer HUD
- racing telemetry clone
- corporate project-management styling

## Dashboard System

Major dashboard changes:
- replaced flat stacked cards with immersive builder OS layout
- added cinematic project hero treatment
- added operational project chips for phase, blockers, and focus
- improved widget hierarchy
- added premium cards and shadow/depth styling
- improved progress instrumentation
- emphasized next-session workflow and build intelligence

Key files:
- `fabricator-app/src/features/projects/DashboardScreen.tsx`
- `fabricator-app/src/components/Card.tsx`
- `fabricator-app/src/components/Screen.tsx`
- `fabricator-app/src/components/Text.tsx`
- `fabricator-app/src/theme/theme.ts`

## Navigation

Navigation was redesigned into a premium floating workshop dock.

Changes:
- bottom tab bar styled as floating industrial dock
- darker navigation surfaces
- stronger active/inactive contrast
- workshop tool iconography
- refined header styling

Key file:
- `fabricator-app/src/navigation/AppNavigator.tsx`

## Photo Gallery / Documentation

The gallery was redesigned into a cinematic build documentation system.

Changes:
- added immersive progress-gallery hero
- added masonry-style photo layout
- improved photo capture card
- added photo-first storytelling direction
- added visual build log presentation

Key file:
- `fabricator-app/src/features/photos/PhotosScreen.tsx`

## Build Log / Timeline

The build log was redesigned into a cinematic workshop chronology.

Changes:
- added build chronology hero
- converted log entries into operational timeline cards
- added event icons for sessions, tasks, parts, and photos
- added premium timeline rail and event nodes
- improved archive feel for long-term project memory

Key file:
- `fabricator-app/src/features/buildLog/TimelineScreen.tsx`

## Garage Session Logging

Garage session logging was upgraded from a simple text note into an operational briefing flow.

Changes:
- added cinematic session hero
- added active session state
- added session intelligence preview
- extracted completed work, remaining work, and materials needed from notes
- improved archive cards

Key file:
- `fabricator-app/src/features/sessions/SessionScreen.tsx`

## Tasks / Operations Board

Tasks were redesigned into an industrial operations board.

Changes:
- grouped tasks by status
- improved task cards
- added operational icons
- emphasized build workflow states
- added tactile card cycling behavior

Key file:
- `fabricator-app/src/features/tasks/TasksScreen.tsx`

## Parts / Inventory Command Center

Parts and materials were redesigned into an inventory command center.

Changes:
- added inventory command header
- added operational stats for needed, ready, and installed items
- improved parts pipeline presentation
- added stronger visual state for parts that need ordering
- retained vendor lookup structure

Key file:
- `fabricator-app/src/features/parts/PartsScreen.tsx`

## Voice Operations System

Voice notes became the core product differentiator.

Current voice workflow:
1. user records shop audio
2. recording is uploaded/transcribed
3. transcript is analyzed for operational items
4. extracted parts, tasks, blockers, and next-session actions are shown
5. user can add extracted items into the build system

Implemented capabilities:
- microphone permission flow
- real local audio recording foundation
- recording timer
- pipeline state display
- voice note history
- extraction of parts, blockers, and next-session items
- promotion of extracted items into tasks and parts

Key files:
- `fabricator-app/src/features/sessions/VoiceNoteScreen.tsx`
- `fabricator-app/src/services/voice/voiceTranscriptionService.ts`

## Audio / Transcription Architecture

The app was moved from mock-only voice notes toward a real speech-to-text pipeline.

Implemented:
- `expo-av` dependency added
- real recording flow
- local audio file capture
- multipart upload preparation
- blob conversion for recorded audio
- transcription service abstraction

Key file:
- `fabricator-app/package.json`

## Supabase Backend

Supabase was introduced as the secure backend layer so testers do not need OpenAI API keys.

Architecture:

```text
Fabricator App
  -> Supabase Edge Function
  -> OpenAI Whisper
  -> transcript response
  -> Fabricator extraction workflow
```

Implemented:
- Supabase Edge Function scaffold
- transcription endpoint
- CORS handling
- server-side OpenAI key usage through Supabase secrets
- mobile app wired to Supabase endpoint
- app no longer needs tester-provided OpenAI keys

Key files:
- `supabase/functions/transcribe/index.ts`
- `fabricator-app/src/config/supabase.ts`
- `fabricator-app/src/services/voice/voiceTranscriptionService.ts`

## Supabase / OpenAI Current Status

The app/backend pipeline was tested through several failure states and debugged successfully.

Resolved issues:
- Supabase JWT 401 fixed by deploying with `--no-verify-jwt`
- audio was initially sent as a URI string instead of a file
- upload was patched to convert local recording into a Blob
- backend diagnostics were improved to expose detailed errors
- OpenAI authentication errors were surfaced clearly

Current confirmed state:
- app records audio
- app uploads to Supabase
- Supabase receives file successfully
- Supabase calls OpenAI transcription endpoint
- OpenAI rejects only because API quota/billing is not enabled

Current blocker:
- OpenAI returned `429 insufficient_quota`
- this means the architecture is working, but OpenAI billing/credits are not active

No current engineering blocker remains for the transcription pipeline once OpenAI quota is enabled.

## Important Commands

Pull latest changes:

```bash
cd ~/Desktop/fabricator
git pull origin main
```

Run app:

```bash
cd ~/Desktop/fabricator/fabricator-app
npx expo start --clear
```

Deploy Supabase function:

```bash
cd ~/Desktop/fabricator
supabase functions deploy transcribe --no-verify-jwt
```

Set OpenAI secret in Supabase:

```bash
supabase secrets set OPENAI_API_KEY=YOUR_KEY
```

List Supabase secrets:

```bash
supabase secrets list
```

## Current Strategic Position

Fabricator is now moving toward its strongest product thesis:

> Capture workshop thinking and turn it into operational build intelligence.

The most important product advantage is not the dashboard alone. It is the loop:

```text
voice note -> transcript -> extracted work -> parts/tasks/blockers -> next-session brief -> persistent project memory
```

## Highest-Leverage Next Steps

Recommended next engineering/product work:
1. structured GPT extraction after transcription
2. persistent dashboard next-session brief
3. unresolved blocker engine
4. measurement extraction
5. supplier/vendor recognition
6. project memory graph
7. tester-ready Supabase auth and storage
8. production-safe rate limiting for transcription
9. richer AI build summaries
10. App Store/TestFlight readiness pass

## Current Known Limitations

- OpenAI billing/quota is not currently active, so live transcription returns `429 insufficient_quota`.
- Supabase function currently handles transcription but not full structured GPT extraction yet.
- Extraction logic is still keyword/rule-based in the app.
- Real user auth, database persistence, and cloud project sync are not fully implemented yet.
- Some screens are visually redesigned but still use MVP-level data models.

## Summary

Fabricator has progressed from a basic Expo MVP into a premium industrial builder OS prototype with:
- strong visual identity
- operational dashboard system
- real recording pipeline
- Supabase backend transcription architecture
- voice-to-workflow intelligence foundation
- photo-first build documentation
- parts/tasks/session workflows

The next major product unlock is structured AI extraction and persistent next-session intelligence.
