# Architecture

## Application

- Expo React Native
- React 19
- React Native 0.81.5
- TypeScript
- Hermes
- Root `App.tsx` entry point
- Root `src/` application source
- Root tracked `ios/` and `android/` native projects

## Auth

Supabase authentication is implemented through `src/auth/AuthProvider.tsx`, `src/auth/AuthScreen.tsx`, and `src/lib/supabase.ts`.

Auth sessions persist with `AsyncStorage` through the Supabase client configuration.

## Persistence

Application project data persists locally through `AsyncStorage` in `src/services/storage/appDataStorage.ts`.

Dashboard layout persistence uses `AsyncStorage` in `src/services/storage/dashboardLayoutStorage.ts`.

Local-data migrations require compatibility and rollback planning.

## Supabase And External Services

Public Supabase configuration is read through Expo public environment variables in `src/lib/supabase.ts`.

`EXPO_PUBLIC_*` values are public mobile application configuration. They are not secrets.

Voice transcription has a Supabase Edge Function path:

- App voice service: `src/services/voice/voiceTranscriptionService.ts`
- Endpoint constant: `src/config/supabase.ts`
- Edge Function: `supabase/functions/transcribe/index.ts`

`src/config/supabase.ts` currently contains a hard-coded transcription Edge Function URL.

The transcription Edge Function uses a server-side OpenAI API key from Supabase configuration. OpenAI secret values must never be placed in the app.

## Risk Areas

- Native project changes are higher risk.
- Auth and session persistence changes are higher risk.
- Cloud synchronization is not confirmed as complete.
- Production file storage and uploads are not confirmed as complete.
- Mock AI, image, and storage services must not be described as live services.
