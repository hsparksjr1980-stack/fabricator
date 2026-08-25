# Fabricator Release Readiness Status

Updated: 2026-08-25

## Completed In Current Branch

- Core trust copy and Settings truthfulness.
- Local data status messaging.
- Friendly auth/backend-unavailable messaging.
- App-level friendly error boundary.
- Project create, edit, complete, archive, reopen, delete safeguards.
- Local Markdown project export.
- Export-before-delete path.
- Task next-session priority.
- Parts status normalization to Needed, Ordered, Received, Installed.
- Parts blocker panel.
- Photo permission recovery and cover/milestone clarity.
- Timeline grouping and broader build-memory activity.
- Shop Help local preview only.
- Pricing search clearly not live.
- Release smoke test checklist.
- Privacy review draft.
- App Store metadata draft.

## Validated Locally

- TypeScript typecheck: passed.
- Whitespace diff check: passed.

## Not Yet Run

- iOS simulator QA.
- Android simulator QA.
- Real-device QA.
- TestFlight build validation.
- Native release build validation.
- App Store submission.

## Remaining Before Public Release Without Monetization

- Run the smoke checklist on simulator.
- Run the same smoke checklist on a real device.
- Fix any clipped labels, dead controls, permission issues, or crash paths found during QA.
- Confirm Supabase auth behavior with the intended staging/project configuration.
- Confirm password reset email flow.
- Confirm privacy labels and App Store copy.
- Confirm no unapproved paid services, production AI, billing, pricing search, cloud sync, or analytics are enabled.

## Explicitly Deferred Until Final Monetization Approval

- One-free-project enforcement.
- Paid multi-project entitlement.
- Server-side entitlement validation.
- Billing provider integration.
- Shop Help paywall.
- Part pricing-search paywall.
- Production AI provider activation.
- Production transcription activation, if needed.
- Pricing-search provider activation.
