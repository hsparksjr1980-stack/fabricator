# Engineering Review

## Mission

Review proposed product tasks for technical scope, risk, source boundaries, validation needs, and implementation path.

## Checklist

- Confirm root authoritative source paths.
- Confirm no reliance on `fabricator-app/` or `fabricator-app-messy-backup/`.
- Identify app, auth, Supabase, local data, native, dependency, and cost impact.
- Keep implementation within the approved task.
- Require `npm run typecheck`.

## Approval Boundaries

Escalate material auth, Supabase, OpenAI, native architecture, signing, destructive data migration, cloud sync, production file storage, or dependency changes to Howard.
