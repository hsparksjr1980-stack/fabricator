# Fabricator Agent Instructions

## Repository Shape

Fabricator is a root-based Expo React Native application.

Authoritative application paths:

- `src/`
- `App.tsx`
- `app.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `ios/`
- `android/`
- `supabase/functions/`

Do not use, modify, restore, delete, move, or rely on:

- `fabricator-app/`
- `fabricator-app-messy-backup/`
- `fabricator-app.worktrees/`

Those folders are local-only, non-authoritative leftovers. Preserved legacy work remains on branch `setup-fabricator-agents` at checkpoint `ef2288c22b70cc089c199572bb0ebf6384fb8365`; do not cherry-pick it without explicit approval.

## Product Mission

Fabricator is a premium but practical mobile-first builder operating system for people managing vehicle, fabrication, restoration, and hands-on build projects.

Product work should emphasize reliable project tracking, build-stage clarity, parts and cost visibility, photo and documentation continuity, mobile usability in a garage or shop, fast data entry, offline resilience, clear project history, and affordable usefulness for hobbyists and independent builders.

Validate product decisions against Howard's Willys Wagon workflow when appropriate.

## Howard OS Operating Mandate

Howard is the product owner and final approver. Howard is not the routine project manager, task coordinator, technical troubleshooter, editor, QA operator, or branch manager.

Fabricator may complete no more than one approved product task and one approved marketing task per weekly cycle. Supporting corrections needed to finish approved tasks are allowed.

Once a task is approved, agents autonomously read operating records, confirm source paths, plan, create an isolated branch, implement, make routine decisions, run validation, diagnose ordinary failures, obtain independent review, address routine review findings, update records, make focused commits, push the branch, open or update a pull request, and prepare the weekly approval package.

## Approval Required

Howard must approve before merge to main, deployment, publication or sending, customer or external-party contact, spending, paid-service activation, pricing or monetization changes, material product-scope expansion, destructive local-data migrations, real cloud synchronization activation, production database activation, production file-storage activation, material auth changes, native architecture changes, signing changes, TestFlight submission, App Store submission, Play Store submission, material OpenAI or Supabase behavior changes, public use of customer data, or consequential safety, savings, productivity, completion, or comparative claims.

Do not ask Howard to approve routine implementation choices, internal naming, normal file organization, reasonable refactoring, minor visual decisions, TypeScript corrections, Expo startup corrections, documentation corrections, review corrections, minor marketing wording, or task decomposition within approved scope.

## Weekly Schedule

Use America/Chicago.

- Daily 8:00 AM: Howard OS Morning Brief
- Daily 3:30 PM: Howard OS Status Check
- Monday 9:00 AM: Engineering Review
- Monday 10:00 AM: Product Review
- Monday 11:00 AM: CEO Portfolio Review
- Monday 11:15 AM: Fabricator Product Intake
- Monday 1:00 PM: Marketing Portfolio Review
- Monday 1:15 PM: Fabricator Marketing Intake
- Tuesday 9:00 AM: Fabricator Product Builder
- Tuesday 1:00 PM: Fabricator Marketing Creator
- Thursday 9:00 AM: Fabricator Independent Review
- Friday 1:00 PM: Fabricator Release Assembly
- Saturday 10:00 AM: Howard Weekly Release Review
- Saturday 11:00 AM: Fabricator Post-Approval Action

If the computer is unavailable, resume when available, preserve stage sequence, record the delay, do not skip stages, and do not infer approval from silence.

## State Machine

`PROPOSED -> ENGINEERING REVIEWED -> PRODUCT SELECTED or MARKETING SELECTED -> CEO CONFIRMED where applicable -> IN PROGRESS -> AGENT REVIEW -> FIXES -> RELEASE READY -> HOWARD REVIEW -> APPROVED -> MERGED or PUBLISHING QUEUE -> COMPLETE`

## Validation

Current supported validation:

```bash
npm ci
npm run typecheck
git diff --check
```

Do not claim lint, tests, native builds, EAS builds, cloud sync, production uploads, deployment, or release validation unless they actually exist and pass.

## Security Rules

Do not print or expose secrets, move service secrets into the mobile app, weaken Supabase auth, change session persistence without approval, introduce destructive local-data migrations, delete or regenerate tracked native projects casually, use production credentials for routine testing, present mocked storage or AI services as live, present local-only data as cloud-synchronized, use customer information publicly, or submit production releases without approval.

The tracked Android debug keystore is acceptable for current local development only. It is not approved for production signing and requires explicit release-hardening review before production distribution.
