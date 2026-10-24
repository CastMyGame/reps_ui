# Assignment workflow

The existing student dashboard/player now reads case-specific work from `/assignments/v1/cases/{id}`. Mobile student home continues to open the shared student dashboard. Office referrals are principal-handled records, not assignments, on both screens.

Students see loading, saving, unsaved, unavailable, submitted and rejection-feedback states. Typing autosaves after 800 ms; **Save progress** saves explicitly and **Save and next question** advances only after a successful save. Reading/radio choices use actual option IDs. Existing reading-retry presentation is reused with controlled draft values; required answers and grading are enforced by the backend at submission. Form submission prevents native page reload.

Refresh reloads server answers and the saved question. A same-tab unsaved draft is cached in sessionStorage under the student/case identity and removed after successful saving or confirmed discard. It is a recovery buffer, not an offline database: only server-saved work survives closing the tab, device changes or forced browser termination. Failed saves stay visible and do not advance the assignment. Version conflicts retain the local draft and require explicit confirmation before replacing it with the current saved version.

Student dashboard navigation/sign-out waits for an unsaved draft to save. It does not clear authentication when saving fails; the existing logout implementation is unchanged. Browser unload warnings protect refresh/closing when possible, but browsers can suppress those warnings, especially on mobile. Shared devices should close the student's tab after use. No new authentication or onboarding policy is introduced.

Staff open **Assignment work** from case records, or use the pending-review actions. The shared panel displays original case records, legacy history, saved answers, submission snapshots and feedback. Rejection requires feedback; successful review reports that notification delivery is tracked separately. Unavailable/legacy work can be explicitly recovered by authorized staff, with the intended template, confirmation and an explanation when prior work exists. Closed legacy history is not reopened automatically. The existing staff incomplete-work completion form now closes a specific record rather than posting an email/infraction pair.

The mobile administrator queue includes submitted (`PENDING`) work and opens the same review panel. Mobile teacher summary records link to the existing full dashboard for individual-case review; the summary DTO is not redesigned.

Creation screens distinguish “case saved” from “assignment unavailable” and show an actionable warning. Backend roles, school membership and recorded case relationships remain authoritative; UI visibility is not authorization.

Deploy the backend first and the frontend immediately afterward, then reload old client tabs. There are no new frontend environment variables, packages or CI gates. See the companion backend `docs/assignment-lifecycle.md` for the state/API and data-compatibility contract. Real disposable-Mongo and browser end-to-end checks remain necessary before pilot use; automated component/MockMvc tests do not prove physical mobile rendering or real database behavior.
