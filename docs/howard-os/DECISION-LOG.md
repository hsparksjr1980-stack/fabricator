# Decision Log

Record meaningful product, architecture, security, pricing, release, and marketing decisions here.

## Decisions

- Current authoritative app structure is root-based: `src/`, `App.tsx`, root package files, tracked `ios/`, tracked `android/`, and `supabase/functions/`.
- `fabricator-app/` and `fabricator-app-messy-backup/` are local-only, non-authoritative leftovers and must not be modified during Howard OS work.
- Preserved legacy work remains on `setup-fabricator-agents` at `ef2288c22b70cc089c199572bb0ebf6384fb8365`.
- Do not port the old session logging workflow during Howard OS setup.
- Use typecheck-only CI initially.
- Do not add lint, test, build, release dependencies, or product behavior changes during Howard OS setup.
- Keep root `package-lock.json` tracked.
- Treat root `ios/` and `android/` as authoritative tracked native projects.
- Keep the currently tracked Android debug keystore unchanged for development; it is not approved for production signing.
- 2026-08-08 Fabricator Post-Approval Action: no explicit current-cycle Howard approval was found for a product PR, deployment, marketing deliverable, publication, sending, spending, pricing, or production activation. No merge, deployment, publication, sending, or publishing-queue action was taken.
- 2026-08-15 Fabricator Post-Approval Action: no explicit Week of 2026-08-10 Howard approval was found or requested for a product PR, deployment, marketing deliverable, publication, sending, spending, pricing, production activation, app-store submission, customer contact, or paid-service action. No merge, deployment, publication, sending, or publishing-queue action was taken.
