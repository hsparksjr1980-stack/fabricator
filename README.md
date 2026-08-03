# Fabricator

Fabricator is a premium but practical mobile-first builder operating system for people managing vehicle, fabrication, restoration, and hands-on build projects.

It is built to help builders keep projects, stages, parts, costs, photos, activity history, and next steps in one place without turning a garage workflow into enterprise project management.

## Current Repository Layout

The application is root-based.

Authoritative source and configuration:

- `src/`
- `App.tsx`
- `app.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `ios/`
- `android/`
- `supabase/functions/`

Do not use local leftover folders as source:

- `fabricator-app/`
- `fabricator-app-messy-backup/`

## Tech Stack

- Expo React Native
- React 19
- React Native 0.81.5
- TypeScript
- Hermes
- Supabase authentication
- AsyncStorage for auth session persistence
- AsyncStorage for local application-data persistence
- Root tracked iOS and Android native projects
- Supabase Edge Function path for voice transcription

## Verified Product Capabilities

- Supabase account signup and sign-in
- Password reset
- Auth session persistence with AsyncStorage
- Project dashboard
- Project creation and editing
- Project lifecycle handling
- Tasks
- Parts
- Photos
- Cover and milestone photo behavior
- Activity timeline and logs
- Budget fields and metrics
- Advisor user interface and provider adapter layer
- Voice transcription path
- Local project-data persistence through AsyncStorage

## Partial Or Unfinished Capabilities

These should not be described as fully live:

- Cloud project database synchronization
- Production file storage and uploads
- Several advisor providers
- Mock AI, image, and storage services
- Structured AI extraction
- Collaboration
- Offline synchronization conflict handling
- Production deployment workflow
- Mature automated testing
- Lint tooling
- CI beyond typecheck

## Setup

Use npm from the repository root.

```bash
npm install
```

## Supported Commands

```bash
npm start
npm run ios
npm run android
npm run web
npm run typecheck
```

No lint, automated test, production build, cloud-sync verification, production upload, or deployment command is currently defined in `package.json`.

## Environment Configuration

Copy `.env.example` to `.env` for local development values.

`EXPO_PUBLIC_*` variables are public mobile application configuration. Server secrets must remain server-side.

OpenAI secret values must never be placed in the mobile app. The transcription Edge Function reads the OpenAI key from Supabase server-side configuration.

## Native Projects

The root `ios/` and `android/` folders are authoritative tracked native projects.

The tracked Android debug keystore is acceptable for current local development. It is not approved for production signing and requires explicit release-hardening review before production distribution.

Do not delete, regenerate, or materially alter tracked native projects casually.

## Howard OS

Howard OS operating records live under `docs/howard-os/`.

Howard is the product owner and final approver. Fabricator may complete no more than one approved product task and one approved marketing task per weekly cycle.

No merge, deployment, publication, spending, pricing change, customer contact, production-data change, production auth/storage/sync activation, signing change, or store submission may happen without Howard approval.
