# Design Standards

Fabricator should feel industrial, practical, trustworthy, mobile-first, builder-focused, and affordable.

## Product Experience

- Optimize for phone use in a garage, shop, driveway, or workbench setting.
- Favor large touch targets and low typing burden.
- Keep project actions visible and predictable.
- Make next steps, parts, budget, and photo evidence easy to scan.
- Avoid enterprise clutter.
- Avoid AI-first interaction patterns unless the approved task specifically calls for them.

## Interface Principles

- Use existing React Native and Expo patterns in the app.
- Preserve the current visual language unless the approved task requires change.
- Keep visual changes focused and reviewable.
- Visible changes require preview evidence before release readiness.

## Product Completion

A product task is ready only when acceptance criteria are met, documentation is updated, `npm run typecheck` passes, Expo starts successfully where practical, relevant platform smoke checks are completed, no critical security or data-loss issue remains, visual evidence exists for visible changes, a pull request is open, and risks and assumptions are documented.
