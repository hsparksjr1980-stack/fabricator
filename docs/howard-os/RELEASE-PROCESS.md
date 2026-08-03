# Release Process

## Product Task Flow

`PROPOSED -> ENGINEERING REVIEWED -> PRODUCT SELECTED -> CEO CONFIRMED where applicable -> IN PROGRESS -> AGENT REVIEW -> FIXES -> RELEASE READY -> HOWARD REVIEW -> APPROVED -> MERGED -> COMPLETE`

## Marketing Task Flow

`PROPOSED -> MARKETING SELECTED -> CEO CONFIRMED where applicable -> IN PROGRESS -> AGENT REVIEW -> FIXES -> RELEASE READY -> HOWARD REVIEW -> APPROVED -> PUBLISHING QUEUE -> COMPLETE`

## Product Completion Standard

A product task is ready only when acceptance criteria are met, documentation is updated, `npm run typecheck` passes, Expo starts successfully where practical, relevant platform smoke checks are completed, no critical security or data-loss issue remains, visual evidence exists for visible changes, a pull request is open, and risks and assumptions are documented.

Do not claim lint or test coverage that does not exist.

## Marketing Completion Standard

A marketing task is ready only when a complete deliverable exists, factual review passes, brand review passes, claims review passes, editorial review passes, SEO review is completed where applicable, distribution assets are included, duplication is checked, nothing has been published or sent, and risks and assumptions are documented.

## Approval Gates

Howard approval is required before merge, deployment, publication, spending, pricing changes, production data changes, production auth/storage/sync activation, native signing changes, store submissions, material OpenAI or Supabase behavior changes, or consequential public claims.

## Validation

Current supported validation:

```bash
npm ci
npm run typecheck
git diff --check
```

Do not perform native builds during routine Howard OS setup.
