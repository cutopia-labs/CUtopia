# Verification email recovery

`recover-verification.js` recovers confirmed failed registration emails for
accounts that are still unverified. It preserves registration time and gives
each replacement code a new 24-hour validity period. It does not reset passwords
or send to every unverified account.

Before selecting accounts, compare failed initial-email records with the current
account's username, student number, registration time and pending verification
code. Exclude replaced accounts and already verified accounts. Keep the selected
records in a private JSON array containing `_id`, `username`, `SID`, `createdAt`
and `veriCode`. Neither that file nor production environment files belong in Git
or public workflow artifacts.

Run from the repository root with the production environment file and audited
candidate file selected explicitly. Without `--apply`, the command only counts
eligible accounts:

```sh
node backend/tools/recover-verification.js /private/path/email.env /private/path/confirmed.json
node backend/tools/recover-verification.js /private/path/email.env /private/path/confirmed.json --apply
```

The script rechecks the account and pending code immediately before sending.
A unique `emailrecoveries` ledger key prevents repeat sends within the recovery
campaign. Inspect aggregate `sent`, `skipped` and `failed` counts afterward;
SMTP acceptance confirms submission, rather than final inbox delivery. Respect
the sender's daily recipient allowance and leave capacity for normal account
email. Sending stops after three SMTP failures.

Do not blindly clear a `sending` ledger entry after an interrupted process:
SMTP may have accepted that message before the ledger was updated. Reconcile it
against the sender's sent mail before deciding whether another send is needed.
The script rolls back the new code when all configured senders fail normally.
OAuth `invalid_grant` failures require the relevant mailbox owner to reauthorize
that sender; changing retry counts cannot restore a revoked grant.
