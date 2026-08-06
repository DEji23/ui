/**
 * Developer platform reference.
 *
 * The PRD's target is "1-day implementation max", so the console shows the
 * four core endpoints, the exact error codes a client must branch on, and
 * the sandbox scenarios that reproduce each one.
 */

export interface ApiEndpoint {
  id: string
  method: "POST" | "GET"
  path: string
  title: string
  description: string
  requestSample: string
  responseSample: string
  idempotent: boolean
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "auth",
    method: "POST",
    path: "/auth/api-key",
    title: "Authenticate",
    description:
      "Exchange organisation credentials for a scoped API key. Every subsequent request carries it in the x-api-key header.",
    requestSample: `POST /auth/api-key
Content-Type: application/json

{
  "client_id": "org_sterling",
  "client_secret": "••••••••"
}`,
    responseSample: `200 OK

{
  "api_key": "rk_live_9f2c…",
  "environment": "PRODUCTION",
  "scopes": ["customers:write", "mandates:write", "recoveries:write"],
  "expires_at": "2026-11-04T00:00:00Z"
}`,
    idempotent: false,
  },
  {
    id: "customers",
    method: "POST",
    path: "/customers",
    title: "Create Customer",
    description:
      "Registers a borrower. Identity is not trusted until iGree consent completes.",
    requestSample: `POST /customers
x-api-key: rk_live_9f2c…
Idempotency-Key: cus_req_8891

{
  "first_name": "Emeka",
  "last_name": "Okonkwo",
  "phone": "+2348012345678",
  "email": "emeka@example.com",
  "loan_reference": "LN-2024-0001"
}`,
    responseSample: `201 Created

{
  "customer_id": "cus_123",
  "status": "PENDING_CONSENT"
}`,
    idempotent: true,
  },
  {
    id: "consent",
    method: "POST",
    path: "/consent/initiate",
    title: "Initiate Consent",
    description:
      "Starts the iGree journey. Returns a redirect URL for BVN entry, channel selection and OTP.",
    requestSample: `POST /consent/initiate
x-api-key: rk_live_9f2c…
Idempotency-Key: cns_req_4410

{
  "customer_id": "cus_123",
  "callback_url": "https://partner.example.ng/consent/return"
}`,
    responseSample: `202 Accepted

{
  "consent_id": "cns_001",
  "redirect_url": "https://igree.nibss-plc.com.ng/authorise?token=…",
  "expires_in": 900
}`,
    idempotent: true,
  },
  {
    id: "mandates",
    method: "POST",
    path: "/mandates",
    title: "Create Mandate",
    description:
      "Creates a direct debit mandate against a BVN-linked account. Provider is NDD or Remita per the borrower's selection.",
    requestSample: `POST /mandates
x-api-key: rk_live_9f2c…
Idempotency-Key: mnd_req_2201

{
  "customer_id": "cus_123",
  "account_number": "0123456789",
  "bank_code": "058",
  "provider": "NDD",
  "max_amount": 1000000,
  "start_date": "2026-06-06",
  "end_date": "2027-06-06"
}`,
    responseSample: `201 Created

{
  "mandate_id": "mnd_001",
  "reference": "MND-GTB-20240606-001",
  "status": "PENDING_APPROVAL",
  "validation_status": "USER_ACTION_REQUIRED"
}`,
    idempotent: true,
  },
  {
    id: "recoveries",
    method: "POST",
    path: "/recoveries",
    title: "Trigger Recovery",
    description:
      "Hands a due obligation to the orchestration engine. The engine picks the account, rail, amount and timing.",
    requestSample: `POST /recoveries
x-api-key: rk_live_9f2c…
Idempotency-Key: rec_req_7781

{
  "loan_id": "LN-2024-1247",
  "amount_due": 487500,
  "due_date": "2026-06-27"
}`,
    responseSample: `202 Accepted

{
  "recovery_id": "rec_9912",
  "decision": {
    "account": "058-0123456789",
    "rail": "NDD",
    "amount": 487500,
    "scheduled_at": "2026-06-27T09:00:00Z",
    "confidence_score": 0.83
  }
}`,
    idempotent: true,
  },
]

export interface ErrorCode {
  code: string
  http: number
  message: string
  retryable: boolean
  guidance: string
}

export const ERROR_CODES: ErrorCode[] = [
  {
    code: "INSUFFICIENT_FUNDS",
    http: 402,
    message: "Account has no balance",
    retryable: true,
    guidance:
      "The engine holds for a credit event rather than retrying blindly. Do not resubmit.",
  },
  {
    code: "NO_MANDATE",
    http: 409,
    message: "No active mandate on this account",
    retryable: true,
    guidance: "Recovery falls back to EasyPay automatically. Create a mandate to restore the direct debit rail.",
  },
  {
    code: "MANDATE_REVOKED",
    http: 409,
    message: "Mandate has been revoked",
    retryable: false,
    guidance: "Re-consent the borrower before creating a replacement mandate.",
  },
  {
    code: "DO_NOT_HONOR",
    http: 402,
    message: "Bank declined the debit",
    retryable: false,
    guidance: "Repeated responses blacklist the account. Try an alternate BVN-linked account.",
  },
  {
    code: "ACCOUNT_CLOSED",
    http: 410,
    message: "Account no longer exists",
    retryable: false,
    guidance: "Account is dropped from the pool permanently.",
  },
  {
    code: "BANK_TIMEOUT",
    http: 504,
    message: "Bank did not respond within the timeout",
    retryable: true,
    guidance: "Query transaction status before resubmitting — the debit may have succeeded.",
  },
  {
    code: "DISPUTE_OPEN",
    http: 423,
    message: "Loan is in DISPUTE OPEN — recovery is blocked",
    retryable: false,
    guidance: "No retry is permitted until the dispute closes. This is a hard guardrail.",
  },
  {
    code: "IDEMPOTENCY_CONFLICT",
    http: 409,
    message: "Idempotency key reused with a different payload",
    retryable: false,
    guidance: "Generate a fresh key, or resend the identical payload to receive the original response.",
  },
  {
    code: "CIRCUIT_OPEN",
    http: 503,
    message: "Rail circuit breaker is open",
    retryable: true,
    guidance: "The rail is failing above threshold. Recovery reroutes automatically; no client action needed.",
  },
  {
    code: "RATE_LIMITED",
    http: 429,
    message: "Too many requests",
    retryable: true,
    guidance: "Back off exponentially. Retry-After indicates the wait.",
  },
]

export const WEBHOOK_SAMPLE = `POST https://partner.example.ng/hooks/recova
X-Recova-Signature: t=1786012800,v1=5257a869e7ec…
Content-Type: application/json

{
  "event": "recovery.success",
  "id": "evt_88213004",
  "created_at": "2026-08-06T09:12:04Z",
  "data": {
    "loan_id": "LN-28471",
    "recovery_id": "rec_9912",
    "amount": 487500,
    "rail": "NDD",
    "transaction_reference": "TX-88213004"
  }
}`
