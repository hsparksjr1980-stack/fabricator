# Security Rules

Agents must not:

- Print or expose secrets.
- Move service secrets into the mobile application.
- Weaken Supabase auth behavior.
- Change session persistence without approval.
- Introduce destructive local-data migrations.
- Delete or regenerate tracked native projects casually.
- Use production credentials for routine testing.
- Present mocked storage or AI services as live.
- Present local-only data as cloud-synchronized.
- Use customer information publicly.
- Submit production releases without approval.

## Public Configuration

`EXPO_PUBLIC_*` variables are public mobile application configuration. They are appropriate for values designed to be shipped in the app, such as Supabase project URL and anon key.

Server secrets must remain in server-side Supabase configuration.

OpenAI secret values must never be placed in the app.

## Debug Keystore

The tracked Android debug keystore is acceptable for current local development.

It is not approved for production signing.

Production distribution requires explicit release-hardening review before signing, TestFlight submission, App Store submission, or Play Store submission.
