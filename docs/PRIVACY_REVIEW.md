# Fabricator Privacy Review

Status: draft for pre-launch review.

## Current Data Behavior

- Project records are stored locally on the device.
- Local project records include projects, tasks, parts, costs, photos metadata, voice-note transcripts, and timeline activity.
- Camera, photo library, and microphone permissions are requested only when the user starts the related workflow.
- Supabase auth is configured for account creation, sign-in, sign-out, password reset, and session persistence.
- Cloud backup and cloud project sync are not presented as live.
- Production AI, paid Shop Help, pricing search providers, analytics, billing, and external vendor APIs are not active.

## Permissions

- Camera: used to document build progress.
- Photo Library: used to select project photos for build tracking.
- Microphone: used for garage voice notes.

## Data Export

- Project export is local Markdown generated from data available on the device.
- Export includes generated date, project summary, tasks, parts, costs, photos list, voice notes, and timeline.
- Export is not paywalled.

## Pre-Launch Requirements

- Confirm App Store privacy labels match actual data collection.
- Confirm no secrets are shipped in the mobile app.
- Confirm no analytics, production AI, pricing APIs, or billing providers are enabled without approval.
- Confirm password reset email behavior in the Supabase project.
- Confirm TestFlight build does not include misleading cloud sync, backup, pricing, or AI claims.
