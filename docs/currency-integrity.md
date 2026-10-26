# Currency UI compatibility

Requires the companion transaction-based backend before deployment. The server is authoritative for all balances and authorization. No new frontend environment variables or dependencies are required.

Desktop and mobile shout-out forms validate whole-number amounts against the complete selected-student total. Zero-currency recognition is allowed. Success requires a matching COMMITTED receipt for every selected student. Successful responses update the displayed staff wallet. Failed requests preserve form values; uncertain outcomes instruct users to retry unchanged or check records before starting a new award. A synchronous in-flight guard prevents rapid duplicate submissions.

The existing action interceptor now includes redemptions and staff-budget resets. Failed/uncertain responses retain the action ID in sessionStorage; confirmed responses release it for a new deliberate action. Changed payloads represent a new action, so users must keep uncertain requests unchanged. Do not clear pending action storage merely to retry. There is no claim of exactly-once email provider delivery.

Redemption rejects nonpositive/fractional amounts and totals above the displayed balance, disables duplicate submissions and retains the cart on failures. A complete server response is required before showing success. The backend revalidates the entire operation atomically.

Automated coverage includes aggregate validation, committed-receipt matching, incomplete-response action-ID retention, mobile multi-student totals, input preservation and rapid submits. Desktop/mobile physical-device and browser-layout verification remains a manual pre-pilot check. Local transaction-capable MongoDB setup and compatibility/rollback details are in the backend `docs/currency-transactions.md`.
