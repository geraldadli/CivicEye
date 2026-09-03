# CivicEye Spec A — Trust Foundation & Verified Reporting

**Date:** 2026-09-03
**Status:** Design — awaiting review
**Scope:** Sub-project 0, 1 and 2 of the CivicEye production roadmap
**Constraints:** Solo implementer, tight deadline. Course deliverable engineered to
production standards; money flows built against sandbox payment rails only.

---

## 1. Context

CivicEye today is a 6,500-line client-side React SPA on an InsForge (Postgres) backend.
The UI is substantially complete: citizen reporting, community forum, a staff triage
portal, points and rewards. There is no server-side code, no tests, no CI, and no
migrations.

The application has no trust boundary. Three findings block every feature on the
product roadmap:

1. **All data is world-readable and world-writable.** Every table in
   `supabase_schema.sql` carries `FOR ALL USING (true) WITH CHECK (true)`, and the anon
   key ships in the browser bundle. Any visitor can read every citizen's `nik`
   (16-digit national ID), address, phone and email — all stored in plaintext — and can
   write arbitrary rows. Under Indonesia's PDP Law (UU 27/2022) this is regulated
   personal data.
2. **Balances are computed in the browser.** `donateToProject` reads `user.points` from
   React state, subtracts, and writes the result. `claimVolunteerTaskPayout` computes
   `newCash = user.cashBalance + payout` client-side. Any user can set any balance.
   Separately, `profiles.points` is authoritative while `transactions` is written by a
   second, non-atomic call — the two drift silently.
3. **Roles are self-assigned.** `registerUser` inserts `role: 'staff'` directly from a
   client dropdown; the fallback path is `authUser.email?.includes("staff")`.

Two further gaps are in scope because they are what the product actually promises:

4. **GPS does not exist.** `ReportPage.tsx` hardcodes a location string, the green "GPS
   Terdeteksi" badge is unconditional decoration, `navigator.geolocation` appears
   nowhere, and `reports` has no coordinate columns.
5. **Fundraising has no abuse control.** `proposeProject` inserts directly;
   `approveProjectProposal` immediately creates a live fundable project with a default
   Rp 10,000,000 target. One click, no sponsor, no accountability. This is an
   embezzlement vector, and a feed of low-credibility open donations destroys trust in
   the legitimate ones.

## 2. Goals

- No client can read personal data belonging to another user.
- No client can alter its own point or cash balance by any means.
- Balances are derived from an append-only ledger and can never disagree with it.
- Staff privilege cannot be self-granted.
- Reports carry verified device coordinates, and the UI never claims a GPS lock it
  does not have.
- A fundraiser cannot exist without corroborated evidence and a named, accountable
  sponsor.
- Abuse controls are enforced server-side, where they cannot be bypassed.
- Security-critical invariants are covered by automated tests that fail loudly.

## 3. Non-goals (deferred, see §11)

Volunteer job marketplace; real money movement; AI budget audit; creator program; staff
HR; native app and device attestation; licensed KYC; full edge-function API layer;
internationalisation; realtime subscriptions.

## 4. Architecture decision

**Strict RLS + column-level grants + `SECURITY DEFINER` RPC.**

The trust boundary lives in Postgres rather than in an application server. Three
mechanisms compose:

- **Row-level security** decides which rows a role may touch, using `auth.uid()` across
  InsForge's `anon` / `authenticated` / `project_admin` roles.
- **Column-level grants** decide which *columns* a role may write. `authenticated`
  receives `UPDATE (full_name, phone, address)` on `profiles` and nothing more, so
  `points` and `cash_balance` are physically unwritable from any client regardless of
  what the browser sends.
- **`SECURITY DEFINER` functions**, invoked through `insforge.database.rpc()`, are the
  only path that can change a balance. Each writes its ledger row and its balance in a
  single transaction.

Rejected alternatives:

- *Full edge-function API layer* (every mutation as a TypeScript function). Cleaner to
  test, but requires rewriting all ~25 mutations plus deploy plumbing, which does not
  fit the deadline — and it is strictly weaker than a database-enforced guarantee,
  since it depends on a service-role key held in function code.
- *RLS only, keep client arithmetic.* Not a real option: if `authenticated` holds
  `UPDATE` on `profiles`, users write their own balances; once revoked, balances can
  only change via RPC. This collapses into the chosen approach.

### InsForge specifics that shape the implementation

- Policies do **not** grant privileges. A table with correct policies but no matching
  `GRANT` fails before RLS is consulted. Every policy in the migration is paired with
  its grant.
- Any helper function called from an RLS policy must be `SECURITY DEFINER`, or
  policy-to-policy recursion can OOM the server.
- Raw SQL from `insforge db query` and migrations runs as `project_admin`.

## 5. Data model changes

### 5.1 Ledger becomes the source of truth

`transactions` becomes append-only and authoritative. `profiles.points` and
`profiles.cash_balance` are retained as **cached projections**, written only by RPC
inside the same transaction as the ledger row, and reconciled by a test that asserts
`SUM(ledger) = balance` for every user.

```sql
ALTER TABLE transactions
  ADD COLUMN balance_after integer NOT NULL,
  ADD COLUMN idempotency_key text UNIQUE,
  ADD COLUMN created_by uuid REFERENCES auth.users(id);

REVOKE UPDATE, DELETE ON transactions FROM authenticated;
```

`idempotency_key` makes a retried donation or payout claim safe. `balance_after` makes
tampering detectable after the fact.

### 5.2 Reports gain identity and geometry

```sql
ALTER TABLE reports
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN lat double precision,
  ADD COLUMN lng double precision,
  ADD COLUMN accuracy_m double precision,
  ADD COLUMN captured_at timestamptz,
  ADD COLUMN location_source text NOT NULL DEFAULT 'unavailable'
    CHECK (location_source IN ('gps','manual','unavailable')),
  ADD COLUMN corroborates_report_id text REFERENCES reports(id),
  ADD COLUMN evidence_grade boolean NOT NULL DEFAULT false,
  ADD COLUMN image_hash text;

CREATE INDEX reports_geo_idx ON reports (lat, lng);
CREATE INDEX reports_user_time_idx ON reports (user_id, created_at DESC);
```

`citizen_name` is backfilled into `user_id` and then dropped from client-visible
surfaces. The existing rate limiter keys on `citizen_name`, a display string that both
collides between users and is trivially spoofed; `user_id` fixes both.

`evidence_grade` is computed at insert, never client-supplied. It is true only when
`location_source = 'gps'` and `accuracy_m <= 500` and the client clock is within 10
minutes of server time.

### 5.3 PII minimisation

Raw NIK is never persisted.

```sql
ALTER TABLE profiles
  ADD COLUMN nik_hash text UNIQUE,
  ADD COLUMN nik_last4 text,
  ADD COLUMN kelurahan text,
  ADD COLUMN trust_tier smallint NOT NULL DEFAULT 0,
  ADD COLUMN phone_verified_at timestamptz;

-- after backfill
ALTER TABLE profiles DROP COLUMN nik;
```

`nik_hash` is SHA-256 over the NIK plus a server-side pepper held in InsForge secrets,
computed inside `fn_verify_identity`; the raw value is discarded in the same statement.
It preserves uniqueness (one account per national ID) and supports display via
`nik_last4`, while leaving nothing meaningful to leak. This is both cheaper and stronger
than encryption at rest.

A `public_profiles` view exposes only `id`, `display_name`, `trust_tier` and
`kelurahan`; `profiles` itself becomes readable by its owner and by staff only.

### 5.4 Fundraising is split from proposing

`projects` currently conflates a plan with a fundraiser. Split:

```sql
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  kind text NOT NULL,          -- RT/RW, karang taruna, yayasan, school
  kelurahan text NOT NULL,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz
);

CREATE TABLE sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id text NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('organization','cosigners')),
  organization_id uuid REFERENCES organizations(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sponsorship_cosigners (
  sponsorship_id uuid REFERENCES sponsorships(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  signed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sponsorship_id, user_id)
);

ALTER TABLE projects
  ADD COLUMN proposal_id text REFERENCES proposals(id),
  ADD COLUMN sponsorship_id uuid REFERENCES sponsorships(id),
  ADD COLUMN fundraising_open boolean NOT NULL DEFAULT false,
  ADD COLUMN budget jsonb,
  ADD COLUMN escrow_state text NOT NULL DEFAULT 'none'
    CHECK (escrow_state IN ('none','tranche_1','tranche_2','complete'));
```

`fundraising_open` can only be set true by `fn_open_fundraiser`, which enforces every
gate in §6. `escrow_state` and `budget` are unused by this spec but designed now so the
money spec drops in without another migration.

### 5.5 Audit log

```sql
CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  subject_table text NOT NULL,
  subject_id text NOT NULL,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;
```

Every privileged action — approvals, rejections, role grants, tier changes, fundraiser
openings — writes a row from inside its RPC. Append-only.

## 6. Trust and credibility model

Three distinct problems, three distinct mechanisms. Conflating them is why naive
moderation designs fail.

| Problem | Mechanism |
|---|---|
| Volume spam | Server-side cooldowns and per-area quotas |
| Is the need real? | Evidence gate over corroborated GPS reports |
| Is the money safe? | Named sponsor, four-eyes approval, staged release |

### 6.1 Three separate objects

- **Report** — anyone at tier 1+, cheap, GPS-verified. This is *evidence*.
- **Proposal** — a plan addressing a cluster of reports. Requires tier 2. Carries no
  money.
- **Fundraiser** — attaches to an approved proposal. Requires a sponsor and a published
  budget.

### 6.2 The gates on `fn_open_fundraiser`

1. **Evidence gate.** The proposal must reference at least 3 `evidence_grade` reports
   from at least 3 distinct users within 250m of the proposal location, filed within the
   last 90 days. Computed in SQL; costs no staff time. Faking it requires several
   distinct verified accounts physically present at the location over days — expensive
   for a fraudster, free for a legitimate organiser.
2. **Sponsor gate.** Either an `organizations` row verified by staff, or at least two
   tier-3 co-signers whose registered `kelurahan` matches the proposal's. Co-signer
   names render on the fundraiser card: accountability is a name, not a handle.
3. **Four-eyes rule.** The approving staff member must not be the sponsor, a co-signer,
   or a `project_members` row for that project. Enforced in the function, not by policy.
4. **Budget gate.** `budget` must be present and itemised, and the sum of line items
   must equal `target`. No more silent Rp 10,000,000 defaults.
5. **Audit.** Approval writes an `audit_log` row naming the approver.

### 6.3 Feed segregation

The default community feed lists only projects with `fundraising_open = true`.
Unsponsored proposals live in a separate "needs a sponsor" tab. The main feed's
credibility floor is therefore high *by construction* rather than by continuous
moderation effort — which is the direct answer to "too many open donations turn people
off."

### 6.4 Trust tiers

Earned, never self-claimed. `trust_tier` is writable only by RPC.

| Tier | Reached by | Unlocks |
|---|---|---|
| 0 Anonymous | Sign up | Read, upvote |
| 1 Phone-verified | OTP | File reports, comment |
| 2 Resident | Tier 1 + NIK checksum + kelurahan in service area | Propose, apply for paid tasks |
| 3 Vouched | Tier 2 + 3 accepted reports + no rejections in 90d | Co-sign a sponsorship |
| 4 Organization | Staff-reviewed org documents | Sponsor solo, receive escrow |

Tier 4 attaches to an `organizations` row, not to a person.

## 7. Verified reporting

### 7.1 Capture

`navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true` and a 15s
timeout. The client submits `lat`, `lng`, `accuracy_m` and `captured_at` to
`fn_submit_report`; it does not submit `evidence_grade`, which the server computes.

Badge states replace the current unconditional green label, and each is honest:

| State | Condition | Copy |
|---|---|---|
| acquiring | request in flight | "Mencari lokasi…" |
| locked | `accuracy_m <= 50` | "GPS terdeteksi (±Nm)" |
| weak | `50 < accuracy_m <= 500` | "Sinyal GPS lemah (±Nm)" |
| denied | permission refused | "Izin lokasi ditolak — masukkan lokasi manual" |
| unsupported | no geolocation API | "Perangkat tidak mendukung GPS" |

A denied or unsupported report is still accepted, flagged `location_source = 'manual'`,
and **does not count toward the evidence gate**. This is what makes the credibility
model load-bearing rather than decorative.

The map preview keeps the existing keyless `maps.google.com/maps?q=...&output=embed`
iframe, switched from a text query to `q=<lat>,<lng>`.

### 7.2 Server-side anti-abuse in `fn_submit_report`

- **Self-flood:** reject if the same `user_id` has submitted within 3 minutes. Replaces
  today's client-side check keyed on a display name.
- **Daily quota:** reject beyond 10 reports per user per day, and beyond 30 reports per
  kelurahan per hour, to bound both individual and coordinated flooding.
- **Clock skew:** reject `evidence_grade` if `captured_at` differs from `now()` by more
  than 10 minutes.
- **Corroboration, not rejection:** if an open report of the same category exists within
  75m filed in the last 48h, set `corroborates_report_id` and return a
  "laporan Anda memperkuat laporan #N" response. Duplicates become evidence strength.
  Only same-user repeats count as spam.
- **Image reuse:** `image_hash` (SHA-256) is kept. It catches only byte-identical
  re-uploads and is recorded as a weak signal that flags for review, not an automatic
  rejection. Re-encoding defeats it; perceptual hashing is deferred.

Distance is computed by a `SECURITY DEFINER` haversine SQL function over the indexed
`(lat, lng)` columns, with a bounding-box prefilter. This avoids taking a PostGIS
dependency.

### 7.3 Honest limitation

Coordinates come from the browser's geolocation API and can be spoofed by a determined
user with devtools or a mocked location. Nothing in a web SPA can prevent that; genuine
device attestation (Play Integrity / App Attest) requires a native app and is deferred.
What this design does achieve is that spoofing becomes *costly at scale*: the evidence
gate needs three distinct verified residents, each rate-limited and quota-bound, and
every fundraiser carries a named sponsor and a four-eyes approval on the audit log. The
spec states this limit explicitly rather than implying GPS is proof.

## 8. RPC surface

Each function is `SECURITY DEFINER`, validates `auth.uid()` first, writes its audit row,
and is the only writer of the columns it owns.

| Function | Owns | Key checks |
|---|---|---|
| `fn_submit_report` | `reports` insert, `evidence_grade` | §7.2 |
| `fn_award_points` | `profiles.points`, ledger | staff or system caller only |
| `fn_donate` | ledger, `projects.donated` | sufficient balance, `fundraising_open` |
| `fn_claim_payout` | `profiles.cash_balance`, ledger | task completed and unclaimed |
| `fn_redeem_voucher` | `profiles.points`, `user_vouchers` | sufficient balance, idempotent |
| `fn_verify_identity` | `nik_hash`, `trust_tier` | NIK checksum, one account per NIK |
| `fn_grant_staff` | `profiles.role` | existing staff caller, audit-logged |
| `fn_open_fundraiser` | `projects.fundraising_open` | all of §6.2 |
| `fn_approve_proposal` | `proposals.status` | staff, four-eyes |

`registerUser` stops inserting `role`. A trigger on `auth.users` creates the profile
row at tier 0 with `role = 'volunteer'`; staff is reachable only through
`fn_grant_staff`.

## 9. Security invariants and testing

No test infrastructure exists today. Rather than chase coverage, this spec adds
assertion tests for the invariants that carry the security claims, runnable via
`insforge db query`:

1. `anon` cannot `SELECT` `nik_hash`, `phone`, `address` or `email` from `profiles`.
2. `authenticated` cannot read another user's `profiles` row.
3. `authenticated` cannot `UPDATE points` or `cash_balance` by any statement.
4. `SUM(transactions.amount)` per user per type equals the cached balance, for all users.
5. `transactions` rejects `UPDATE` and `DELETE` from `authenticated`.
6. `fn_submit_report` rejects a second report from the same user within 3 minutes.
7. `fn_submit_report` marks a report `evidence_grade = false` when
   `location_source = 'manual'`.
8. `fn_open_fundraiser` rejects when fewer than 3 distinct users corroborate.
9. `fn_open_fundraiser` rejects when the approver is also a co-signer.
10. `fn_grant_staff` rejects a non-staff caller.
11. A duplicate `idempotency_key` on `fn_donate` does not double-charge.

Vitest covers the pure functions: haversine, NIK checksum, tier computation, badge-state
selection. Each is a small pure function precisely so it is testable without a database.

## 10. Migration and rollout

Sequenced so the app is never broken between steps.

1. **Migration 1 — additive.** New columns, tables, indexes and the `public_profiles`
   view. Nothing dropped. App continues working unchanged.
2. **Backfill.** `reports.citizen_name` to `user_id` by matching `profiles.full_name`,
   with unmatched rows reported for manual resolution. Existing `profiles.points` and
   `cash_balance` become opening-balance ledger rows so invariant 4 holds from day one.
   NIK values are hashed and the raw column dropped.
3. **RPCs and tests.** Deploy the functions in §8 with their tests. Balances are still
   client-writable at this point, so nothing breaks.
4. **Frontend cutover.** Rewrite the 5 money-touching AppContext functions to call
   `rpc()`. Rewrite `ReportPage` for real geolocation. Split proposal and fundraiser UI.
5. **Migration 2 — the lockdown.** Drop the permissive policies, install real policies
   with matched grants, and revoke column privileges. This is the commit where the
   security claims become true; it must land only after step 4 is verified.
6. **Rename.** `supabaseClient.ts` to `insforgeClient.ts` and `VITE_SUPABASE_*` to
   `VITE_INSFORGE_*`. Cosmetic, but the codebase currently names the wrong vendor
   throughout.

Rollback for each migration is a paired down-migration; step 5 is the only one where
rollback restores a known-insecure state, so it ships last and alone.

## 11. Deferred work

Each becomes its own spec, in this order:

- **Spec B — Volunteer work marketplace.** Job board, applications, geofenced
  check-in/out, verified completion, wage escrow. Replaces the current
  `volunteer_tasks` demo, which is a single hardcoded row per user seeded from
  `DEFAULT_VOLUNTEER_TASK`.
- **Spec C — Donations, escrow and payouts.** Sandbox payment gateway, milestone
  tranches against receipts, refunds. Populates `budget` and `escrow_state`.
- **Spec D — AI budget audit with human validation.** Receipt OCR, line-item
  reconciliation against `budget`, anomaly flags, mandatory human sign-off before
  release, receipt hash chain published per tranche.
- **Spec E — Growth.** Creator program, staff hiring and HR.

Also deferred: native app and device attestation; licensed KYC; perceptual image
hashing; full edge-function API layer; internationalisation; realtime.

## 12. Honest limitations

- Browser geolocation is spoofable; see §7.3. The design raises the cost of abuse rather
  than eliminating it.
- Money logic lives in SQL, which is less pleasant to test than TypeScript. Mitigated by
  the assertion suite in §9, but it is a real trade-off accepted for the deadline.
- `nik_hash` is not KYC. It proves one account per claimed national ID; it does not
  prove the ID belongs to the person. Real identity assurance needs a licensed provider.
- Points remain minted without reserve (1,250 at signup, +50 per join). This spec makes
  minting auditable and server-controlled but does not fix the economics. If donations
  ever move real money, the points-to-rupiah conversion at `pointsAmount * 100` must be
  severed from the donation path — flagged for Spec C.
- The `full_name` join in `approveProjectProposal` currently mis-assigns membership on
  name collisions. Fixed here as a side effect of adding `user_id`, and called out so it
  is not rediscovered as a bug later.
