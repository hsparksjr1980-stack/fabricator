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
