# Fabricator v1 Smoke Test Checklist

Run this before TestFlight or public-release approval. Use simulator first, then repeat the same path on a real device.

## Account And Startup

- App opens without a blank screen.
- Sign in failure shows friendly account copy, not raw provider errors.
- Session restores after closing and reopening the app.
- Sign out returns to the auth screen.
- Backend-unavailable state gives a retry path and does not crash.

## Project Library And Dashboard

- Create a project.
- Open the project dashboard from the library.
- Edit project name, category, phase, and budget.
- Complete, archive, reopen, and delete a test project only after confirming the prompts.
- Dashboard labels fit: progress, expected cost, actual cost, remaining budget.
- Settings shows version, local data status, and coming-soon items truthfully.

## Tasks

- Add a task in under 10 seconds.
- Add a task with next-session priority enabled.
- Add a matching part from a task.
- Edit task title, work area, status, notes, and next-session priority.
- Tap a task to cycle To Do, In Progress, Done.
- Confirm completed tasks update dashboard progress.

## Parts

- Add a part with status Needed, Ordered, Received, and Installed.
- Confirm part counts update correctly.
- Confirm the blockers panel shows Needed and Ordered parts.
- Edit vendor, estimated cost, actual cost, status, work area, and description.
- Confirm project cost totals update.
- Tap pricing search and confirm it is clearly labeled as not live.

## Photos

- Add from camera.
- Add from gallery.
- Deny camera or photo permission and confirm recovery copy appears.
- Confirm Save Photo is disabled before selecting an image.
- Set a cover photo.
- Mark and unmark a milestone photo.
- Confirm photos appear in the timeline.

## Timeline And Activity

- Add one task, part, photo, milestone, voice note, and project edit.
- Confirm timeline groups activity by day.
- Confirm titles and details are readable without awkward truncation.
- Confirm recent dashboard activity includes more than photos.

## Voice Notes

- Deny microphone permission and confirm recovery copy appears.
- Record a short note.
- Stop recording and confirm the note saves or shows a friendly transcription-unavailable message.
- Review local extraction suggestions before adding them to tasks or parts.

## Export

- Export a project from the dashboard.
- Confirm the export includes generated date, project summary, tasks, parts, costs, photos, voice notes, and timeline.
- Confirm export copy says data came from local device data.
- Confirm export failure shows a recovery message.

## Shop Help Preview

- Open Shop Help.
- Confirm it is positioned as Shop Help, not AI-first.
- Confirm only local preview/help mode is available.
- Run priority, troubleshooting, and photo-review previews.
- Confirm no production AI, billing, paid entitlement, or pricing API is presented as live.

## Final Visual Pass

- Check bottom tabs for clipped labels.
- Check compact devices for wrapped budget labels.
- Check touch targets on task, part, photo, and dashboard actions.
- Check dark-mode contrast in Settings, Timeline, Parts, and Shop Help.
- Confirm no visible dead controls.
