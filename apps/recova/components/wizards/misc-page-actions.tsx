"use client"

import * as React from "react"
import {
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Plus,
  RefreshCw,
  Save,
  UserPlus,
} from "lucide-react"

import { can } from "@/lib/domain/rbac"
import { ROLES, ROLE_LABEL, type Role } from "@/lib/domain/rbac"
import { CURRENT_USER } from "@/lib/data/session"
import { addUser, BUSINESS_UNITS, type AppUser } from "@/lib/data/users"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input, Label, Select } from "@/components/ui/input"
import { ResultDialog } from "@/components/queues/action-dialogs"

/**
 * Small, single-step creation dialogs and fire-and-forget page-header
 * actions that don't warrant their own file (compare the multi-step
 * `CreateMandateDialog` for something with real branching).
 */

function useResult() {
  const [result, setResult] = React.useState<{ title: string; message: string } | null>(
    null
  )
  return { result, setResult }
}

/* ------------------------------------------------------------------ */
/* API & Webhooks — New API Key                                        */
/* ------------------------------------------------------------------ */

const SCOPES = ["customers:write", "mandates:write", "recoveries:write", "webhooks:manage"]

function CreateApiKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}) {
  const [label, setLabel] = React.useState("")
  const [environment, setEnvironment] = React.useState("Sandbox")
  const [scopes, setScopes] = React.useState<string[]>(["customers:write"])
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setLabel("")
      setEnvironment("Sandbox")
      setScopes(["customers:write"])
      setGeneratedKey(null)
    }
  }, [open])

  const valid = label.trim() !== "" && scopes.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={generatedKey ? "API Key Created" : "New API Key"}
        description={
          generatedKey ? undefined : "Scoped credentials for a client integration"
        }
        footer={
          generatedKey ? (
            <Button variant="primary" size="lg" block onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="sm:flex-1"
                disabled={!valid}
                onClick={() => {
                  const prefix = environment === "Production" ? "rk_live_" : "rk_test_"
                  const key = `${prefix}${Math.random().toString(36).slice(2, 10)}`
                  setGeneratedKey(key)
                  onCreated(`${environment} key "${label}" generated with ${scopes.length} scope${scopes.length === 1 ? "" : "s"}.`)
                }}
              >
                Generate Key
              </Button>
            </div>
          )
        }
      >
        {generatedKey ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <KeyRound className="size-12 text-brand" />
            <div className="w-full rounded-[var(--radius-control)] bg-surface p-4">
              <p className="font-mono text-sm font-semibold text-ink">{generatedKey}</p>
            </div>
            <p className="text-xs text-subtle">
              This is the only time the full key is shown. Store it securely — only the
              prefix is retrievable afterwards.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="key-label">Key label *</Label>
              <Input
                id="key-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Partner Lender — Sandbox"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="key-env">Environment</Label>
              <Select
                id="key-env"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                <option>Production</option>
                <option>UAT</option>
                <option>Sandbox</option>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scopes *</Label>
              {SCOPES.map((scope) => (
                <label key={scope} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-brand)]"
                    checked={scopes.includes(scope)}
                    onChange={(e) =>
                      setScopes((prev) =>
                        e.target.checked ? [...prev, scope] : prev.filter((s) => s !== scope)
                      )
                    }
                  />
                  <span className="font-mono text-xs text-body">{scope}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ApiWebhooksPageActions() {
  const mayConfigure = can(CURRENT_USER.role, "webhook.configure")
  const [open, setOpen] = React.useState(false)
  const { result, setResult } = useResult()

  return (
    <>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayConfigure}
        title={mayConfigure ? undefined : "Requires the webhook.configure permission."}
        onClick={() => setOpen(true)}
      >
        New API Key
        <Plus />
      </Button>
      <CreateApiKeyDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(message) => setResult({ title: "API key created", message })}
      />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Users — Invite User                                                  */
/* ------------------------------------------------------------------ */

function InviteUserDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (user: AppUser) => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [businessUnit, setBusinessUnit] = React.useState<string>(BUSINESS_UNITS[0])
  const [role, setRole] = React.useState<Role>("DRO")

  React.useEffect(() => {
    if (open) {
      setName("")
      setEmail("")
      setBusinessUnit(BUSINESS_UNITS[0])
      setRole("DRO")
    }
  }, [open])

  const valid = name.trim() !== "" && /\S+@\S+\.\S+/.test(email)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Invite User"
        description="Phase 1 of internal onboarding — activation email and temporary password are generated automatically"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() => {
                const user = addUser({ name: name.trim(), email: email.trim(), businessUnit, role })
                onInvited(user)
                onOpenChange(false)
              }}
            >
              Send Invitation
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="iu-name">Full name *</Label>
            <Input id="iu-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="iu-email">Work email *</Label>
            <Input
              id="iu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@vfdmfb.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="iu-bu">Business unit *</Label>
            <Select id="iu-bu" value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)}>
              {BUSINESS_UNITS.map((bu) => (
                <option key={bu} value={bu}>
                  {bu}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="iu-role">Role *</Label>
            <Select id="iu-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function UsersPageActions({
  onUserAdded,
}: {
  onUserAdded: (user: AppUser) => void
}) {
  const [open, setOpen] = React.useState(false)
  const { result, setResult } = useResult()

  return (
    <>
      <Button variant="primary" className="h-12 px-5" onClick={() => setOpen(true)}>
        Invite User
        <UserPlus />
      </Button>
      <InviteUserDialog
        open={open}
        onOpenChange={setOpen}
        onInvited={(user) => {
          onUserAdded(user)
          setResult({
            title: "Invitation sent",
            message: `Invitation sent to ${user.email}. ${user.name} is assigned the ${ROLE_LABEL[user.role]} role in ${user.businessUnit} and appears below with status "Invitation Sent". Temporary password: ${user.tempPassword} — activation link: /activate/${user.id}. They'll land in Account Activation once they set a real password, enrol MFA and accept both policies.`,
          })
        }}
      />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Organisations — Create Organisation                                 */
/* ------------------------------------------------------------------ */

function CreateOrganisationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}) {
  const [companyName, setCompanyName] = React.useState("")
  const [rcNumber, setRcNumber] = React.useState("")
  const [businessEmail, setBusinessEmail] = React.useState("")
  const [contactPerson, setContactPerson] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setCompanyName("")
      setRcNumber("")
      setBusinessEmail("")
      setContactPerson("")
    }
  }, [open])

  const valid =
    companyName.trim() !== "" &&
    rcNumber.trim() !== "" &&
    /\S+@\S+\.\S+/.test(businessEmail) &&
    contactPerson.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Register Organisation"
        description="Phase 1 of external onboarding — Organization Registration"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() => {
                onCreated(
                  `${companyName} registered. Status is Organization Pending Verification — duplicate check, compliance review and business verification run before Compliance Approval unlocks.`
                )
                onOpenChange(false)
              }}
            >
              Submit Registration
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-name">Company name *</Label>
            <Input id="org-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-rc">RC number *</Label>
            <Input id="org-rc" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} placeholder="RC1234567" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-email">Business email *</Label>
            <Input
              id="org-email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="org-contact">Contact person *</Label>
            <Input id="org-contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </div>
          <p className="text-xs text-subtle">
            CAC certificate, regulatory license and authorised signatory documents are
            uploaded once the compliance review opens the case.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OrganisationsPageActions({ mayApprove }: { mayApprove: boolean }) {
  const [open, setOpen] = React.useState(false)
  const { result, setResult } = useResult()

  return (
    <>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayApprove}
        title={mayApprove ? undefined : "Requires the role.assign permission."}
        onClick={() => setOpen(true)}
      >
        Create Organisation
        <Plus />
      </Button>
      <CreateOrganisationDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(message) => setResult({ title: "Registration submitted", message })}
      />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Loans — Create Loan                                                  */
/* ------------------------------------------------------------------ */

const PRODUCTS = ["Retail Salary Loan", "SME Working Capital", "Asset Finance", "Micro Loan"]

function CreateLoanDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}) {
  const [borrower, setBorrower] = React.useState("")
  const [amount, setAmount] = React.useState("500000")
  const [product, setProduct] = React.useState(PRODUCTS[0])
  const [tenure, setTenure] = React.useState("6")

  React.useEffect(() => {
    if (open) {
      setBorrower("")
      setAmount("500000")
      setProduct(PRODUCTS[0])
      setTenure("6")
    }
  }, [open])

  const valid = borrower.trim() !== "" && Number(amount) > 0 && Number(tenure) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Create Loan"
        description="Adds a disbursed loan to the book with a generated repayment schedule"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="sm:flex-1"
              disabled={!valid}
              onClick={() => {
                onCreated(
                  `Loan for ${borrower} created — ₦${Number(amount).toLocaleString()} over ${tenure} months (${product}). It enters the recovery queue automatically on the first missed obligation.`
                )
                onOpenChange(false)
              }}
            >
              Create Loan
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cl-borrower">Borrower name *</Label>
            <Input id="cl-borrower" value={borrower} onChange={(e) => setBorrower(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cl-product">Product *</Label>
            <Select id="cl-product" value={product} onChange={(e) => setProduct(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cl-amount">Amount (₦) *</Label>
              <Input id="cl-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cl-tenure">Tenure (months) *</Label>
              <Input id="cl-tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LoansPageActions() {
  const [open, setOpen] = React.useState(false)
  const { result, setResult } = useResult()

  return (
    <>
      <Button
        variant="soft"
        className="h-12 px-5"
        onClick={() =>
          setResult({
            title: "Export queued",
            message: "The loan book export is queued. BVN and account numbers are masked in the file.",
          })
        }
      >
        Export Book
        <Download />
      </Button>
      <Button variant="primary" className="h-12 px-5" onClick={() => setOpen(true)}>
        Create Loan
        <Plus />
      </Button>
      <CreateLoanDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(message) => setResult({ title: "Loan created", message })}
      />
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Simple fire-and-forget page actions                                 */
/* ------------------------------------------------------------------ */

export function AuditTrailPageActions() {
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="soft"
        className="h-12 px-5"
        onClick={() =>
          setResult({
            title: "Export queued",
            message: "The audit log export is queued as a signed, tamper-evident CSV covering the current filter set.",
          })
        }
      >
        Export Log
        <Download />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function NotificationRulesPageActions() {
  const mayEdit = can(CURRENT_USER.role, "policy.configure")
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayEdit}
        title={mayEdit ? undefined : "Requires the policy.configure permission."}
        onClick={() =>
          setResult({
            title: "Changes saved",
            message: "Notification templates updated. Live from the next scheduled send — in-flight messages are unaffected.",
          })
        }
      >
        Save Changes
        <Save />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function PolicyEnginePageActions() {
  const mayEdit = can(CURRENT_USER.role, "policy.configure")
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayEdit}
        title={mayEdit ? undefined : "Requires the policy.configure permission."}
        onClick={() =>
          setResult({
            title: "Policy saved",
            message: "Recovery policy updated. The orchestration engine picks up the new configuration on the next scheduling cycle — cases already mid-retry finish under the policy that was active when they started.",
          })
        }
      >
        Save Policy
        <Save />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function ReconciliationPageActions() {
  const mayRun = can(CURRENT_USER.role, "reconciliation.run")
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="soft"
        className="h-12 px-5"
        onClick={() =>
          setResult({
            title: "Export queued",
            message: "The reconciliation report — matched, unmatched and duplicate entries — is queued for export.",
          })
        }
      >
        Export Report
        <FileSpreadsheet />
      </Button>
      <Button
        variant="primary"
        className="h-12 px-5"
        disabled={!mayRun}
        title={mayRun ? undefined : "Requires the reconciliation.run permission."}
        onClick={() =>
          setResult({
            title: "Reconciliation started",
            message: "Matching internal ledger entries against the latest NDD, Remita and EasyPay settlement files. New exceptions will appear in the table once matching completes.",
          })
        }
      >
        Run Reconciliation
        <RefreshCw />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function SettlementsPageActions() {
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="soft"
        className="h-12 px-5"
        onClick={() =>
          setResult({
            title: "Export queued",
            message: "The ledger export is queued as a signed CSV covering every debit, reversal and refund entry in the current view.",
          })
        }
      >
        Export Ledger
        <Download />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

export function GenerateReportButton() {
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="primary"
        className="h-12 px-5"
        onClick={() =>
          setResult({
            title: "Report queued",
            message: "A custom report build is queued using the current period's data. You'll be notified when it's ready in Spool Exports.",
          })
        }
      >
        Generate Report
        <FileSpreadsheet />
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}

const FORMAT_ICON = {
  CSV: FileText,
  XLSX: FileSpreadsheet,
  ZIP: FileArchive,
} as const

export function SpoolReportDownload({
  name,
  format,
}: {
  name: string
  format: keyof typeof FORMAT_ICON
}) {
  const { result, setResult } = useResult()
  return (
    <>
      <Button
        variant="soft"
        size="sm"
        onClick={() =>
          setResult({
            title: "Download starting",
            message: `${name} (${format}) is being prepared. Sensitive fields are masked in every spool export.`,
          })
        }
      >
        {format}
      </Button>
      <ResultDialog
        open={result !== null}
        onOpenChange={(o) => !o && setResult(null)}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </>
  )
}
