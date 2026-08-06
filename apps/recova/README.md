# RECOVA — Automated Loan Recovery Tool (VFD MFB)

Operations console for multi-rail, consent-based loan recovery.

Built from the VFD MFB PRD set on Confluence and the
[Loan Recovery Tool Figma file](https://www.figma.com/design/fTItFQjxaWNF8JHgw6F2na/Loan-Recovery-Tool?node-id=6002-452)
(page "Core").

## Run

```bash
pnpm install --filter=recova
pnpm --filter=recova dev     # http://localhost:4100
pnpm --filter=recova build
pnpm --filter=recova typecheck
```

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript · Tailwind v4 · Radix
primitives · Recharts · lucide-react. Design tokens live in `app/globals.css`
under `@theme inline`, lifted verbatim from the Figma library.

## Structure

```
app/(app)/            One route per sidebar entry (24 screens)
components/ui/        Primitives: button, badge, card, table, tabs, sheet, dialog, alert
components/shared/    Domain-aware: stat cards, status pills, queue toolbar, page header
components/<module>/  Feature modules: recovery, consent, mandates, rails, escalation, disputes
lib/domain/           The engines (see below)
lib/data/             Seed datasets standing in for the backing services
```

## Domain layer

The PRD's engines are implemented as pure, testable modules — no I/O, no
ambient clock — so every decision is reproducible in an audit.

| Module | Responsibility |
| --- | --- |
| `domain/types.ts` | Vocabulary: rails, recovery/mandate/dispute/ledger states |
| `domain/state-machine.ts` | Deterministic recovery state machine + `retryEligibility` |
| `domain/rbac.ts` | Action-level permissions, role mapping, maker-checker, assignment rules |
| `domain/policy.ts` | Configurable recovery policy + `validatePolicy` guardrails |
| `domain/orchestration.ts` | Account ranking, rail selection, debit sizing, retry ladder, failure classification |
| `domain/reconciliation.ts` | Settlement matching and exception classification |
| `domain/billing.ts` | Rail tariffs, cost/price separation, unit economics |

### Guardrails enforced in code, not convention

- **No retry while a loan is in `DISPUTE_OPEN`.** `retryEligibility()` is the
  single implementation consulted by the scheduler, the orchestration engine
  and the manual retry button in the UI.
- **Action-level RBAC.** Screens ask `can(role, "refund.approve")`, never
  "is this user Finance". Navigation hides what the role cannot reach.
- **Separation of duties.** No role both initiates and approves a refund; a
  maker cannot approve their own request.
- **Policy over hard-coding.** Retry intervals, rail priority, quiet hours,
  partial thresholds and escalation tiers are configuration; `validatePolicy`
  rejects combinations that would risk double-debiting during settlement lag.
- **Settlement-aware reconciliation.** Each rail has its own tolerance window,
  so a delayed settlement is not misreported as a missing one.

## Data

`lib/data/` holds seed datasets covering every branch the engines handle:
a dispute-blocked case, a legal-review case, partial recoveries, a
mandate-revoked fallback, an all-accounts-blacklisted case, an open circuit
breaker, and reconciliation exceptions of each classification.

Swapping these for API calls is the intended next step — `lib/data/session.ts`
is the seam for real authentication, and every screen already reads permissions
from the signed-in role.
