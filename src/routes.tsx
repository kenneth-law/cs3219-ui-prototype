/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06.
 * Scope: Backlog-driven prototype flows and UI audit fixes. Human review pending; see /ai/usage-log.md. */
import { useEffect, useState } from "react"
import {
  useStore,
  routeHref,
  statusLabel,
  formatTime,
  activeErrand,
  type Errand,
  type Status,
  type Supplier,
} from "./store"
import {
  Button,
  Card,
  CreditPill,
  EmptyState,
  Eyebrow,
  Field,
  Input,
  Overlay,
  Pagination,
  PasswordInput,
  Select,
  Spinner,
  StatusChip,
  Textarea,
  TextLink,
  cx,
  usePaged,
  useUnsavedChanges,
} from "./ui"
import { Navbar } from "./Nav"

// Shared page shell for signed-in routes
function Page({
  children,
  wide,
}: {
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="min-h-full bg-[#F7F8F2]">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={cx(
          "page-content mx-auto px-5 md:px-8 py-8 md:py-10",
          wide ? "max-w-[1200px]" : "max-w-[880px]",
        )}
      >
        {children}
      </main>
      <footer className="site-footer">
        <span>Campus errands · NUS community</span>
        <span>Interactive prototype · changes reset on refresh</span>
      </footer>
    </div>
  )
}

function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-[#283A31]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[#626E63]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/* ============================= 01 Sign Up ============================= */
export function SignUp() {
  const { users, go, signUp } = useStore()
  const [username, setU] = useState("")
  const [email, setE] = useState("")
  const [password, setP] = useState("")
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  useUnsavedChanges(!!(username || email || password))

  const submit = () => {
    const e: Record<string, string> = {}
    if (!username.trim()) e.username = "Choose a username."
    else if (
      users.some(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
      )
    )
      e.username = "That username is already taken."
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address."
    else if (
      users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    )
      e.email = "An account with this email already exists."
    if (
      password.length < 8 ||
      password.length > 64 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      e.password =
        "Use 8–64 characters with uppercase, lowercase, and a number."
    setErrs(e)
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
    if (Object.keys(e).length) return
    setBusy(true)
    signUp(username, email, password)
    setBusy(false)
  }

  return (
    <AuthShell
      title="Create Account"
      footer={
        <>
          Already have an account?{" "}
          <TextLink href={routeHref("sign-in")}>Sign in</TextLink>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
      >
        <Field label="Username" error={errs.username}>
          <Input
            name="username"
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(e) => setU(e.target.value)}
            placeholder="e.g. jordan.k…"
            error={!!errs.username}
          />
        </Field>
        <Field label="Email" error={errs.email}>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setE(e.target.value)}
            placeholder="you@campus.edu…"
            error={!!errs.email}
          />
        </Field>
        <Field
          label="Password"
          error={errs.password}
          hint="8–64 characters, including uppercase, lowercase, and a number."
        >
          <PasswordInput
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            placeholder="Create a password"
            error={!!errs.password}
          />
        </Field>
        <div className="rounded-md bg-[#EAF0E3] px-4 py-3 text-[13px] text-[#24573F]">
          ◈ 100 welcome credits are added automatically when you join.
        </div>
        <Button type="submit" full disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Creating…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

/* ============================= 02 Sign In ============================= */
export function SignIn() {
  const { go, signIn } = useStore()
  const [email, setE] = useState("")
  const [password, setP] = useState("")
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const submit = () => {
    const e: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address."
    if (!password) e.password = "Enter your password."
    setErrs(e)
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
    if (Object.keys(e).length) return
    setBusy(true)
    signIn(email, password)
    setBusy(false)
  }

  return (
    <AuthShell
      title="Sign In"
      footer={
        <>
          New to Campus Errands?{" "}
          <TextLink href={routeHref("sign-up")}>Create an account</TextLink>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
      >
        <Field label="Email" error={errs.email}>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setE(e.target.value)}
            placeholder="you@campus.edu…"
            error={!!errs.email}
          />
        </Field>
        <Field label="Password" error={errs.password}>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            placeholder="Your password"
            error={!!errs.password}
          />
        </Field>
        <div className="text-right">
          <TextLink href={routeHref("forgot-password", email.trim() ? { email: email.trim() } : undefined)}>Forgot password?</TextLink>
        </div>
        <Button type="submit" full disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      <details className="demo-accounts">
        <summary>Try a demo account</summary>
        <p>
          All demo passwords: <code>Passw0rd!</code>
        </p>
        <button
          type="button"
          onClick={() => {
            setE("alex@campus.edu")
            setP("Passw0rd!")
          }}
        >
          Alex · Admin Manager & administrator
        </button>
        <button
          type="button"
          onClick={() => {
            setE("priya@campus.edu")
            setP("Passw0rd!")
          }}
        >
          Priya · requester & courier
        </button>
        <button
          type="button"
          onClick={() => {
            setE("marcus@campus.edu")
            setP("Passw0rd!")
          }}
        >
          Marcus · requester & courier
        </button>
      </details>
    </AuthShell>
  )
}

export function ForgotPassword() {
  const { nav, requestPasswordReset } = useStore()
  const [email, setEmail] = useState(nav.params?.email ?? "")
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.")
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setError("")
    setToken(requestPasswordReset(email))
  }
  return <AuthShell title={token ? "Check your email" : "Forgot password?"} footer={<TextLink href={routeHref("sign-in")}>← Back to sign in</TextLink>}>
    {token ? <div className="space-y-5">
      <p role="status" className="muted text-sm leading-relaxed">If an account exists for <strong className="break-words">{email.trim()}</strong>, a password reset link would be sent to that address.</p>
      <div className="ce-surface p-4 space-y-3">
        <p className="eyebrow">Prototype email preview</p>
        <p className="muted text-sm">No email is sent in this demo. Open the reset link here in the same tab. It expires after 15 minutes and stops working when you refresh.</p>
        <Button full href={routeHref("reset-password", { token })}>Open demo reset link</Button>
      </div>
      <Button variant="ghost" onClick={() => { setToken(""); setError("") }}>Use another email or request a new link</Button>
    </div> : <form className="space-y-5" onSubmit={submit} noValidate>
      <p className="muted text-sm leading-relaxed">Enter the email you used to create your account to get a password reset link.</p>
      <Field label="Email" error={error}><Input type="email" name="email" autoComplete="email" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@campus.edu…" error={!!error} /></Field>
      <Button type="submit" full>Request reset link</Button>
    </form>}
  </AuthShell>
}

export function ResetPassword() {
  const { nav, isResetLinkValid, resetPassword } = useStore()
  const token = nav.params?.token ?? ""
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  useUnsavedChanges(!done && !!(password || confirmation))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (password.length < 8 || password.length > 64 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) next.password = "Use 8–64 characters with uppercase, lowercase, and a number."
    if (!confirmation || password !== confirmation) next.confirmation = "Enter the same password in both fields."
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    if (resetPassword(token, password, confirmation)) {
      setPassword(""); setConfirmation(""); setDone(true)
    }
  }
  if (done) return <AuthShell title="Password updated" footer={<TextLink href={routeHref("sign-in")}>Back to sign in</TextLink>}><div className="space-y-5"><p role="status" className="muted text-sm leading-relaxed">Your password has been changed. Sign in with your new password to continue.</p><Button full href={routeHref("sign-in")}>Sign in with new password</Button></div></AuthShell>
  if (!isResetLinkValid(token)) return <AuthShell title="Link unavailable" footer={<TextLink href={routeHref("sign-in")}>Back to sign in</TextLink>}><div className="space-y-5"><p role="alert" className="muted text-sm leading-relaxed">This reset link is invalid, has expired, or has already been used. Request a new one to try again.</p><Button full href={routeHref("forgot-password")}>Request a new reset link</Button></div></AuthShell>
  return <AuthShell title="Choose a new password" footer={<TextLink href={routeHref("sign-in")}>Back to sign in</TextLink>}>
    <form className="space-y-5" onSubmit={submit} noValidate>
      <Field label="New password" error={errors.password} hint="8–64 characters, including uppercase, lowercase, and a number."><PasswordInput name="new-password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} error={!!errors.password} /></Field>
      <Field label="Confirm new password" error={errors.confirmation}><PasswordInput name="confirm-password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} error={!!errors.confirmation} /></Field>
      <Button type="submit" full>Reset password</Button>
    </form>
  </AuthShell>
}

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main id="main-content" className="auth-layout" tabIndex={-1}>
      <section className="auth-story">
        <a href={routeHref("sign-in")} className="wordmark" translate="no">
          campus<span>errands.</span>
        </a>
        <div>
          <span className="eyebrow">Made for the in-between</span>
          <h2>
            A small favour.
            <br />
            <em>A better campus day.</em>
          </h2>
          <p>
            Prints from the library. A coffee between lectures. Get a hand from
            someone already on their way.
          </p>
        </div>
        <div className="auth-caption">
          <span>01 / Ask for a pickup</span>
          <span>02 / Help someone nearby</span>
          <span>03 / Pass the favour on</span>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <p className="eyebrow">NUS student community</p>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
          {children}
          <p className="mt-6 text-sm muted">{footer}</p>
          <p className="prototype-note">
            Interactive demo. Use sample details; accounts and changes last
            until you refresh.
          </p>
        </div>
      </section>
    </main>
  )
}

/* ============================= 04 Suppliers ============================= */
export function Suppliers() {
  const { suppliers, nav, go } = useStore()
  const query = nav.params?.q ?? "",
    category = nav.params?.category ?? "all"
  const visible = suppliers.filter(
    (s) =>
      s.active !== false &&
      (category === "all" || s.category === category) &&
      `${s.name} ${s.location}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <Page wide>
      <PageHead
        title="Around campus"
        subtitle="Find a pickup point. We’ll help with the rest."
        action={<Button href={routeHref("create")}>Request an errand ↗</Button>}
      />
      <div className="filter-row">
        <Field label="Find a place">
          <Input
            type="search"
            value={query}
            placeholder="Search names or locations…"
            onChange={(e) => go("suppliers", { q: e.target.value, category })}
          />
        </Field>
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) =>
              go("suppliers", { q: query, category: e.target.value })
            }
          >
            <option value="all">All places</option>
            <option>Store</option>
            <option>Facility</option>
            <option>Campus Location</option>
          </Select>
        </Field>
        <span className="result-count">{visible.length} places</span>
      </div>
      <div className="supplier-list">
        {visible.map((s, i) => (
          <article className="supplier-row" key={s.id}>
            <span className="place-number" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="eyebrow">{s.category}</p>
              <h2>
                <a href={routeHref("supplier-details", { id: s.id })}>
                  {s.name}
                </a>
              </h2>
              <p className="muted">{s.description}</p>
            </div>
            <div className="place-meta">
              <span>{s.location}</span>
              <span>{s.hours}</span>
            </div>
            <a
              className="row-arrow"
              href={routeHref("supplier-details", { id: s.id })}
              aria-label={`View ${s.name}`}
            >
              ↗
            </a>
          </article>
        ))}
      </div>
      {!visible.length && (
        <EmptyState
          title="No places found"
          body="Try a different name or choose all categories."
          action={<Button href={routeHref("suppliers")}>Clear filters</Button>}
        />
      )}
    </Page>
  )
}

/* ============================= 05 Supplier Details ============================= */
export function SupplierDetails() {
  const { nav, supplierById, go, userById } = useStore()
  const s = supplierById(nav.params?.id)
  if (!s)
    return (
      <Page>
        <NotFound onBack={() => go("suppliers")} label="Back to Suppliers" />
      </Page>
    )
  return (
    <Page>
      <TextLink className="mb-4 inline-block" href={routeHref("suppliers")}>
        ← Back to Suppliers
      </TextLink>
      <Card className="p-7">
        <span className="inline-block rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] font-medium text-[#626E63]">
          {s.category}
        </span>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight">
          {s.name}
        </h1>
        <p className="mt-3 text-[15px] text-[#626E63] leading-relaxed max-w-prose">
          {s.description}
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Detail label="Operating hours" value={s.hours} />
          <Detail label="Location" value={s.location} />
          <Detail
            label="Recorded by"
            value={userById(s.creatorId)?.username ?? "—"}
          />
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          {s.active !== false ? (
            <Button href={routeHref("create", { supplier: s.id })}>
              Request from here
            </Button>
          ) : (
            <p className="muted">
              This place is inactive and cannot receive new requests.
            </p>
          )}
        </div>
      </Card>
    </Page>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#F7F8F2] px-4 py-3">
      <div className="text-[12px] font-medium text-[#626E63]">{label}</div>
      <div className="mt-0.5 text-[15px] text-[#283A31]">{value}</div>
    </div>
  )
}

/* ============================= 06 Create Errand ============================= */
export function CreateErrand() {
  const { nav, suppliers, currentUser, createErrand, go, supplierById } =
    useStore()
  const pre = supplierById(nav.params?.supplier)
  const [pickup, setPickup] = useState(
    pre ? `${pre.name} — ${pre.location}` : "",
  )
  const [delivery, setDelivery] = useState("")
  const [details, setDetails] = useState("")
  const [credits, setCredits] = useState("15")
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  useUnsavedChanges(!!(pickup || delivery || details))

  const submit = () => {
    const c = Number(credits)
    const e: Record<string, string> = {}
    if (!pickup.trim()) e.pickup = "Choose a pickup supplier or location."
    if (!delivery.trim()) e.delivery = "Enter a delivery location."
    if (!details.trim()) e.details = "Describe what the courier needs to do."
    if (!Number.isSafeInteger(c) || c < 1)
      e.credits = "Enter a whole number of credits, at least 1."
    else if (c > currentUser.available)
      e.credits = "You don't have enough available credits."
    setErrs(e)
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
    if (Object.keys(e).length) return
    setBusy(true)
    const id = createErrand({ pickup, delivery, details, credits: c })
    setBusy(false)
    if (id) go("errand-details", { id })
  }

  return (
    <Page>
      <PageHead
        title="Request an Errand"
        subtitle="Reserve credits and let a campus courier handle it."
      />
      <div className="request-layout grid lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
        <Card className="p-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            noValidate
          >
            <Field label="Pickup supplier or location" error={errs.pickup}>
              <Select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              >
                <option value="">Select a pickup point…</option>
                {suppliers
                  .filter((s) => s.active !== false)
                  .map((s) => (
                    <option key={s.id} value={`${s.name} — ${s.location}`}>
                      {s.name} — {s.location}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Delivery location" error={errs.delivery}>
              <Input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                placeholder="e.g. Tembusu College, lobby…"
                error={!!errs.delivery}
              />
            </Field>
            <Field label="Delivery details" error={errs.details}>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What should the courier pick up and where should they leave it?"
                error={!!errs.details}
              />
            </Field>
            <Field
              label="Credits to reserve"
              error={errs.credits}
              hint={`Available balance: ${currentUser.available} credits.`}
            >
              <Input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                error={!!errs.credits}
              />
            </Field>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Spinner /> Creating…
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
              <Button variant="secondary" href={routeHref("browse")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
        <Card className="p-5">
          <Eyebrow>Summary</Eyebrow>
          <div className="mt-3 space-y-2 text-[14px]">
            <SummaryRow
              label="Reserving"
              value={<CreditPill>{Number(credits) || 0}</CreditPill>}
            />
            <SummaryRow
              label="Available now"
              value={`${currentUser.available}`}
            />
            <SummaryRow
              label="After reserving"
              value={`${currentUser.available - (Number(credits) || 0)}`}
            />
          </div>
          <p className="mt-4 text-[12px] text-[#626E63] leading-relaxed">
            Reserved credits are held until the errand is completed. If it is
            not accepted within 15 minutes or you cancel, they're released back
            to you automatically.
          </p>
        </Card>
      </div>
    </Page>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#626E63]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

/* ============================= 07 Browse Errands ============================= */
export function Browse() {
  const { errands, currentUser, nav, go, acceptErrand } = useStore()
  const query = nav.params?.q ?? "",
    min = nav.params?.min ?? "",
    max = nav.params?.max ?? ""
  const open = errands.filter((e) => e.status === "Open")
  const filtered = open.filter(
    (e) =>
      e.pickup.toLowerCase().includes(query.toLowerCase()) &&
      (min === "" || e.credits >= Number(min)) &&
      (max === "" || e.credits <= Number(max)),
  )
  const { slice, page, pages, setPage } = usePaged(filtered, 6)
  const filter = (key: string, value: string) => {
    go("browse", { ...nav.params, [key]: value, page: "1" })
  }
  return (
    <Page wide>
      <section className="browse-intro">
        <div>
          <span className="eyebrow">The campus noticeboard</span>
          <h1>
            A little help,
            <br />
            <em>on your way.</em>
          </h1>
          <p>
            Pick up something nearby. Make someone’s day.
            <br />
            Earn credits for your next favour.
          </p>
        </div>
        <aside>
          <span className="eyebrow">Your next pickup</span>
          <strong>
            {open.filter((e) => e.requesterId !== currentUser.id).length}
          </strong>
          <span>open errands from your neighbours</span>
          <a href={routeHref("my-errands")}>
            See your activity <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </section>
      <div className="section-line">
        <h2>Open errands</h2>
        <a className="text-link" href={routeHref("create")}>
          Need a hand? Post a request ↗
        </a>
      </div>
      <div className="filter-row">
        <Field label="Pickup location">
          <Input
            type="search"
            value={query}
            onChange={(e) => filter("q", e.target.value)}
            placeholder="Search pickup locations…"
          />
        </Field>
        <Field label="Minimum credits">
          <Input
            type="number"
            min="1"
            step="1"
            value={min}
            onChange={(e) => filter("min", e.target.value)}
            placeholder="Any…"
          />
        </Field>
        <Field label="Maximum credits">
          <Input
            type="number"
            min="1"
            step="1"
            value={max}
            onChange={(e) => filter("max", e.target.value)}
            placeholder="Any…"
          />
        </Field>
        <span className="result-count">{filtered.length} results</span>
      </div>
      {min && max && Number(min) > Number(max) && (
        <p role="alert" className="text-sm text-[#C6362E] mb-4">
          Maximum credits must be at least the minimum.
        </p>
      )}
      <div className="errand-list">
        {slice.map((e) => (
          <article className="errand-row" key={e.id}>
            <div className="errand-reward">
              <strong>{e.credits}</strong>
              <span>credits</span>
            </div>
            <div className="errand-copy">
              <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                <span className="eyebrow">
                  {e.requesterId === currentUser.id
                    ? "Your request"
                    : "Pickup request"}
                </span>
                <Countdown errand={e} />
              </div>
              <h3>
                <a href={routeHref("errand-details", { id: e.id })}>
                  {e.pickup.split(" — ")[0]}
                </a>
              </h3>
              <p className="muted">To {e.delivery}</p>
              <p className="errand-description">{e.details}</p>
            </div>
            <div className="errand-actions">
              <a
                className="text-link"
                href={routeHref("errand-details", { id: e.id })}
              >
                View errand ↗
              </a>
              {e.requesterId !== currentUser.id && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (acceptErrand(e.id)) go("errand-details", { id: e.id })
                  }}
                >
                  Accept errand
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          title={
            open.length ? "No matching errands" : "Nothing waiting right now"
          }
          body={
            open.length
              ? "Try another pickup location or widen the credit range."
              : "New requests will appear here. You can also ask for a pickup."
          }
          action={
            <Button href={routeHref(open.length ? "browse" : "create")}>
              {open.length ? "Clear filters" : "Request an errand"}
            </Button>
          }
        />
      )}
      <Pagination page={page} pages={pages} onPage={setPage} />
    </Page>
  )
}

function Countdown({ errand }: { errand: Errand }) {
  const { clock } = useStore()
  if (errand.status !== "Open") return null
  const seconds = Math.max(
    0,
    Math.ceil((Date.parse(errand.expiresAt) - clock) / 1000),
  )
  return (
    <span
      className={cx("countdown", seconds < 120 && "countdown-urgent")}
      aria-label={`Expires in ${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`}
    >
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} left
    </span>
  )
}

function LabeledLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5 text-[14px]">
      <span className="w-20 shrink-0 text-[#626E63]">{label}</span>
      <span className="text-[#283A31]">{value}</span>
    </div>
  )
}

/* ============================= 08 My Errands ============================= */
export function MyErrands() {
  const { errands, currentUser, go, userById, nav } = useStore()
  const tab = nav.params?.role ?? "requested"
  const status = nav.params?.status ?? "all"
  const requested = errands.filter((e) => e.requesterId === currentUser.id)
  const delivering = errands.filter((e) => e.courierId === currentUser.id)
  const list = (tab === "requested" ? requested : delivering).filter(
    (e) =>
      status === "all" ||
      (status === "active" ? activeErrand(e) : !activeErrand(e)),
  )
  const { slice, page, pages, setPage } = usePaged(list, 4)

  return (
    <Page wide>
      <PageHead
        title="My Errands"
        subtitle="Track requests you've sent and errands you're delivering."
      />
      <div className="filter-row">
        <Field label="Your involvement">
          <Select
            value={tab}
            onChange={(e) => go("my-errands", { role: e.target.value, status })}
          >
            <option value="requested">
              Requested by you ({requested.length})
            </option>
            <option value="delivering">Delivering ({delivering.length})</option>
          </Select>
        </Field>
        <Field label="Show">
          <Select
            value={status}
            onChange={(e) =>
              go("my-errands", { role: tab, status: e.target.value })
            }
          >
            <option value="all">All activity</option>
            <option value="active">Active errands</option>
            <option value="closed">Past errands</option>
          </Select>
        </Field>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            title={
              tab === "requested"
                ? "No requests yet"
                : "Not delivering anything"
            }
            body={
              tab === "requested"
                ? "Create an errand to get started."
                : "Accept an open errand to start delivering."
            }
            action={
              <Button
                href={routeHref(tab === "requested" ? "create" : "browse")}
              >
                {tab === "requested" ? "Request an Errand" : "Browse Errands"}
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {slice.map((e) => (
              <Card
                key={e.id}
                className="p-4 flex flex-wrap items-center gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusChip status={e.status} />
                    <CreditPill>{e.credits} credits</CreditPill>
                    <Countdown errand={e} />
                  </div>
                  <div className="text-[15px] font-medium">
                    {e.pickup.split(" — ")[0]} → {e.delivery}
                  </div>
                  <div className="text-[13px] text-[#626E63]">
                    {tab === "requested"
                      ? e.courierId
                        ? `Courier: ${userById(e.courierId)?.username}`
                        : "Awaiting a courier"
                      : `For ${userById(e.requesterId)?.username}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  href={routeHref("errand-details", { id: e.id })}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        </>
      )}
    </Page>
  )
}

/* ============================= 09 Errand Details / Tracking ============================= */
const timeline: Status[] = [
  "Open",
  "Accepted",
  "In Transit",
  "Delivered",
  "Completed",
]

export function ErrandDetails() {
  const {
    nav,
    errandById,
    currentUser,
    go,
    userById,
    acceptErrand,
    advanceErrand,
    cancelErrand,
  } = useStore()
  const e = errandById(nav.params?.id)
  const [actioning, setActioning] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  if (
    !e ||
    (e.status !== "Open" &&
      e.requesterId !== currentUser.id &&
      e.courierId !== currentUser.id &&
      !currentUser.isAdmin)
  )
    return (
      <Page>
        <NotFound onBack={() => go("my-errands")} label="Back to My Errands" />
      </Page>
    )

  const isRequester = e.requesterId === currentUser.id
  const isCourier = e.courierId === currentUser.id
  const requester = userById(e.requesterId)
  const courier = userById(e.courierId ?? undefined)

  const run = (fn: () => unknown) => {
    setActioning(true)
    fn()
    setActioning(false)
  }

  // Exactly one permitted action
  let action: React.ReactNode = null
  if (isRequester && e.status === "Open")
    action = (
      <Button
        variant="danger"
        disabled={actioning}
        onClick={() => setConfirmCancel(true)}
      >
        Cancel Request
      </Button>
    )
  else if (isRequester && e.status === "Delivered")
    action = (
      <Button
        disabled={actioning}
        onClick={() => run(() => advanceErrand(e.id, "Completed"))}
      >
        Confirm received
      </Button>
    )
  else if (isCourier && e.status === "Accepted")
    action = (
      <Button
        disabled={actioning}
        onClick={() => run(() => advanceErrand(e.id, "In Transit"))}
      >
        Mark as Picked Up
      </Button>
    )
  else if (isCourier && e.status === "In Transit")
    action = (
      <Button
        disabled={actioning}
        onClick={() => run(() => advanceErrand(e.id, "Delivered"))}
      >
        Mark as Delivered
      </Button>
    )
  else if (!isRequester && !isCourier && e.status === "Open")
    action = (
      <Button
        disabled={actioning}
        onClick={() => run(() => acceptErrand(e.id))}
      >
        Accept Request
      </Button>
    )
  else if (!isRequester && !isCourier && e.status !== "Open")
    action = (
      <div className="rounded-md bg-[#F1F1F3] px-4 py-3 text-[13px] text-[#626E63]">
        This request has already been accepted by another courier.
      </div>
    )

  const stageIdx = timeline.indexOf(e.status)

  return (
    <Page wide>
      <div className="flex flex-wrap gap-3 mb-4">
        <TextLink href={routeHref("my-errands")}>← Back to My Errands</TextLink>
      </div>

      <PageHead
        title="Errand details"
        subtitle={`Request ${e.id.slice(0, 10)}`}
      />
      <Overlay
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this request?"
      >
        <div className="p-6">
          <h2>Cancel this request?</h2>
          <p className="muted mt-3">
            The request will leave the open list and {e.credits} reserved
            credits will return to your available balance.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Keep request
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                cancelErrand(e.id)
                setConfirmCancel(false)
              }}
            >
              Cancel request
            </Button>
          </div>
        </div>
      </Overlay>
      <div className="details-layout grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusChip status={e.status} />
              <CreditPill>{e.credits} credits</CreditPill>
              <Countdown errand={e} />
              <span className="text-[13px] text-[#626E63] ml-auto">
                Created {formatTime(e.createdAt)}
              </span>
            </div>
            <LabeledLine label="Pickup" value={e.pickup} />
            <LabeledLine label="Deliver to" value={e.delivery} />
            <div className="mt-3 rounded-md bg-[#F7F8F2] px-4 py-3 text-[14px]">
              {e.details}
            </div>
            <div className="mt-4 grid min-[400px]:grid-cols-2 gap-3">
              <Detail label="Requester" value={requester?.username ?? "—"} />
              <Detail
                label="Courier"
                value={courier?.username ?? "Not assigned yet"}
              />
            </div>

            {/* Progress stays readable at narrow mobile widths. */}
            {!["Cancelled", "Expired"].includes(e.status) && (
              <ol className="errand-timeline" aria-label="Delivery progress">
                {timeline.map((stage, index) => <li key={stage} data-complete={index <= stageIdx} aria-current={stage === e.status ? "step" : undefined}><span aria-hidden="true">{index <= stageIdx ? "✓" : index + 1}</span><span>{statusLabel(stage)}</span></li>)}
              </ol>
            )}

            <div className="mt-6 pt-5 border-t border-[#F1F1F3]">
              {action || (
                <div className="text-[13px] text-[#626E63]">
                  No actions available — this errand is {e.status.toLowerCase()}
                  .
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-[16px] font-semibold mb-3">Activity</h2>
            <ol className="space-y-3">
              {e.activity.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#286749] shrink-0" />
                  <div className="text-[14px]">
                    <span className="font-medium">
                      {userById(a.actorId)?.username ?? "System"}
                    </span>{" "}
                    <span className="text-[#626E63]">{a.text}</span>
                    <div className="text-[12px] text-[#707A6C]">
                      {formatTime(a.time)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {(isRequester || isCourier) && <Chat errand={e} />}
      </div>
    </Page>
  )
}

/* ------- Embedded chat ------- */
function Chat({ errand }: { errand: Errand }) {
  const { currentUser, userById, sendMessage } = useStore()
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const isParticipant =
    errand.requesterId === currentUser.id || errand.courierId === currentUser.id
  const accepted = !!errand.courierId
  const closed = ["Completed", "Cancelled", "Expired"].includes(errand.status)
  const other = userById(
    errand.requesterId === currentUser.id
      ? (errand.courierId ?? undefined)
      : errand.requesterId,
  )

  const send = () => {
    if (!text.trim()) return
    setSending(true)
    setError(false)
    setTimeout(() => {
      if (sendMessage(errand.id, text.trim())) setText("")
      else setError(true)
      setSending(false)
    }, 500)
  }

  return (
    <Card className="chat-panel flex flex-col h-[520px] min-w-0 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#EDEDEF]">
        <h2 className="text-[15px] font-semibold">Chat</h2>
        <p className="text-[12px] text-[#626E63]">
          {accepted
            ? `With ${other?.username ?? "the other party"}`
            : "Available after a courier accepts"}
        </p>
      </div>
      <div role="log" aria-label="Conversation" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 bg-[#FAFAFB]">
        {!accepted ? (
          <div className="text-[13px] text-[#626E63] text-center pt-10">
            Chat opens once this request is accepted.
          </div>
        ) : errand.messages.length === 0 ? (
          <div className="text-[13px] text-[#626E63] text-center pt-10">
            No messages yet. Say hello!
          </div>
        ) : (
          errand.messages.map((m) => {
            const mine = m.senderId === currentUser.id
            return (
              <div
                key={m.id}
                className={cx(
                  "flex flex-col max-w-[80%]",
                  mine ? "ml-auto items-end" : "items-start",
                )}
              >
                <div
                  className={cx(
                    "px-3.5 py-2 rounded-lg text-[14px]",
                    mine
                      ? "bg-[#286749] text-white rounded-br-md"
                      : "bg-white border border-[#D8DFD1] rounded-bl-md",
                  )}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[11px] text-[#707A6C]">
                  {userById(m.senderId)?.username} · {formatTime(m.time)}
                </span>
              </div>
            )
          })
        )}
      </div>
      {accepted && isParticipant && !closed ? (
        <div className="p-3 border-t border-[#EDEDEF]">
          {error && (
            <div className="mb-2 text-[12px] text-[#C6362E]">
              Message failed to send. Try again.
            </div>
          )}
          <div className="chat-composer flex gap-2">
            <Input
              aria-label="Message"
              name="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="h-11 min-w-0 flex-1"
            />
            <Button
              className="min-w-20 shrink-0 whitespace-nowrap"
              onClick={send}
              disabled={sending || !text.trim()}
            >
              {sending ? <Spinner /> : "Send"}
            </Button>
          </div>
        </div>
      ) : accepted && closed ? (
        <div className="p-3 border-t border-[#EDEDEF] text-center text-[12px] text-[#626E63]">
          This errand is closed — chat is read-only.
        </div>
      ) : null}
    </Card>
  )
}

/* ============================= 10 Profile ============================= */
export function Profile() {
  const { currentUser, users, updateProfile, go } = useStore()
  const [editing, setEditing] = useState(false)
  const [username, setU] = useState(currentUser.username)
  const [email, setE] = useState(currentUser.email)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  useUnsavedChanges(
    editing &&
      (username !== currentUser.username || email !== currentUser.email),
  )

  const save = () => {
    const e: Record<string, string> = {}
    if (!username.trim()) e.username = "Username can't be empty."
    else if (
      users.some(
        (u) =>
          u.id !== currentUser.id &&
          u.username.toLowerCase() === username.trim().toLowerCase(),
      )
    )
      e.username = "That username is taken."
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email."
    else if (
      users.some(
        (u) =>
          u.id !== currentUser.id &&
          u.email.toLowerCase() === email.trim().toLowerCase(),
      )
    )
      e.email = "That email is in use."
    setErrs(e)
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
    if (Object.keys(e).length) return
    if (!updateProfile(username.trim(), email.trim())) return
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Page>
      <PageHead title="Profile" />
      <Card className="p-7">
        <p className="muted mb-5 text-sm">
          Requester & courier{currentUser.isAdmin ? " · Administrator" : ""}
          {currentUser.isAdminManager ? " · Admin Manager" : ""}. Switch your
          active role from the account menu.
        </p>
        {saved && (
          <div
            role="status"
            className="mb-4 rounded-md bg-[#E5F4E8] px-4 py-2.5 text-[13px] text-[#248A3D]"
          >
            Profile updated.
          </div>
        )}
        {!editing ? (
          <>
            <Detail label="Username" value={currentUser.username} />
            <div className="h-3" />
            <Detail label="Email" value={currentUser.email} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setU(currentUser.username)
                  setE(currentUser.email)
                  setErrs({})
                  setEditing(true)
                }}
              >
                Edit
              </Button>
            </div>
          </>
        ) : (
          <form className="space-y-4 max-w-md" onSubmit={event => { event.preventDefault(); save() }} noValidate>
            <Field label="Username" error={errs.username}>
              <Input
                name="username"
                autoComplete="username"
                spellCheck={false}
                value={username}
                onChange={(e) => setU(e.target.value)}
                error={!!errs.username}
              />
            </Field>
            <Field label="Email" error={errs.email}>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setE(e.target.value)}
                error={!!errs.email}
              />
            </Field>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Page>
  )
}

/* ============================= 11 Credits ============================= */
export function Credits() {
  const { currentUser, txns: allTxns, go } = useStore()
  const txns = allTxns.filter((t) => t.userId === currentUser.id)
  const { slice, page, pages, setPage } = usePaged(txns, 5)
  return (
    <Page>
      <PageHead
        title="Credits"
        subtitle="Your campus credit balance and history."
      />
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <Eyebrow>Available</Eyebrow>
          <div className="mt-2 text-[32px] font-semibold tracking-tight">
            {currentUser.available}
          </div>
        </Card>
        <Card className="p-5">
          <Eyebrow>Reserved</Eyebrow>
          <div className="mt-2 text-[32px] font-semibold tracking-tight">
            {currentUser.reserved}
          </div>
          <div className="text-[13px] text-[#626E63]">
            Held on active errands
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#EDEDEF]">
          <h2 className="text-[15px] font-semibold">Transactions</h2>
        </div>
        {txns.length === 0 ? (
          <EmptyState
            title="No transactions"
            body="Your credit activity will appear here."
          />
        ) : (
          <ul>
            {slice.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F1F1F3] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium">{t.type}</div>
                  <div className="transaction-note text-[13px] text-[#626E63]">
                    {t.note} · {formatTime(t.time)}
                    {t.errandId ? " · " : ""}
                    {t.errandId && (
                      <a
                        href={routeHref("errand-details", { id: t.errandId! })}
                        className="text-[#286749] hover:underline"
                      >
                        View errand
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={cx(
                    "shrink-0 whitespace-nowrap text-[15px] font-semibold tabular-nums",
                    t.amount >= 0 ? "text-[#248A3D]" : "text-[#283A31]",
                  )}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="mt-6">
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </Page>
  )
}

/* ============================= 12 Supplier Management ============================= */
export function AdminSuppliers() {
  const {
    suppliers,
    go,
    saveSupplier,
    deleteSupplier,
    userById,
    currentUser,
    errands,
  } = useStore()
  const { slice, page, pages, setPage } = usePaged(suppliers, 5)
  const [sheet, setSheet] = useState<Supplier | "new" | null>(null)
  const [confirm, setConfirm] = useState<Supplier | null>(null)
  if (!currentUser.isAdmin)
    return (
      <Page>
        <EmptyState
          title="Administrator access required"
          body="Your account does not have permission to manage suppliers."
        />
      </Page>
    )

  return (
    <Page wide>
      <PageHead
        title="Supplier Management"
        subtitle="Admin tools for campus suppliers."
        action={
          <Button onClick={() => setSheet("new")}>Create Supplier</Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1.4fr_1fr_1.2fr_1fr_240px] gap-4 px-5 py-3 bg-[#FAFAFB] border-b border-[#EDEDEF] text-[12px] font-semibold text-[#626E63] uppercase tracking-wide">
          <span>Name</span>
          <span>Category</span>
          <span>Location</span>
          <span>Recorded by</span>
          <span className="text-right">Actions</span>
        </div>
        {slice.map((s) => (
          <div
            key={s.id}
            className="supplier-admin-row grid lg:grid-cols-[1.4fr_1fr_1.2fr_1fr_240px] gap-1.5 lg:gap-4 px-5 py-4 border-b border-[#F1F1F3] last:border-0 lg:items-center"
          >
            <div className="font-medium text-[15px]">
              {s.name}
              <span className="block text-xs muted mt-1">
                {s.active === false ? "Inactive" : "Active"}
              </span>
            </div>
            <div className="text-[14px] text-[#626E63]">
              <span className="lg:hidden text-[#707A6C]">Category · </span>
              {s.category}
            </div>
            <div className="text-[14px] text-[#626E63]">
              <span className="lg:hidden text-[#707A6C]">Location · </span>
              {s.location}
            </div>
            <div className="text-[14px] text-[#626E63]">
              <span className="lg:hidden text-[#707A6C]">Recorded by · </span>
              {userById(s.creatorId)?.username}
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2 lg:mt-0 lg:justify-end">
              <Button
                size="sm"
                variant="ghost"
                href={routeHref("supplier-details", { id: s.id })}
              >
                View
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSheet(s)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={
                  s.active === false ||
                  errands.some((e) => e.supplierId === s.id && activeErrand(e))
                }
                title={
                  errands.some((e) => e.supplierId === s.id && activeErrand(e))
                    ? "Has active errands"
                    : undefined
                }
                onClick={() => setConfirm(s)}
              >
                {s.active === false ? "Inactive" : "Deactivate"}
              </Button>
              {errands.some(
                (e) => e.supplierId === s.id && activeErrand(e),
              ) && (
                <span className="text-xs muted">
                  Active errands prevent deactivation
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>
      <div className="mt-6">
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <SupplierSheet
        open={sheet !== null}
        supplier={sheet === "new" ? null : sheet}
        onClose={() => setSheet(null)}
        onSave={(d) => {
          if (saveSupplier(d)) setSheet(null)
        }}
      />

      <Overlay open={confirm !== null} onClose={() => setConfirm(null)}>
        <div className="p-6">
          <h2 className="text-[18px] font-semibold">Deactivate supplier?</h2>
          <p className="mt-2 text-[14px] text-[#626E63]">
            “{confirm?.name}” will be hidden from active places. Existing errand
            history will keep its supplier information.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm && deleteSupplier(confirm.id)) setConfirm(null)
              }}
            >
              Deactivate
            </Button>
          </div>
        </div>
      </Overlay>
    </Page>
  )
}

function SupplierSheet({
  open,
  supplier,
  onClose,
  onSave,
}: {
  open: boolean
  supplier: Supplier | null
  onClose: () => void
  onSave: (d: Partial<Supplier> & { id?: string }) => void
}) {
  const { currentUser } = useStore()
  const [f, setF] = useState({
    name: "",
    category: "Store",
    description: "",
    hours: "",
    location: "",
  })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [initialized, setInitialized] = useState<string | null>(null)
  useUnsavedChanges(
    open &&
      Object.entries(f).some(
        ([key, value]) =>
          value !==
          (supplier?.[(key as keyof Supplier)] ??
            (key === "category" ? "Store" : "")),
      ),
  )

  // Sync form when sheet opens for a given target
  const key = supplier?.id ?? "new"
  if (open && initialized !== key) {
    setF(
      supplier
        ? {
            name: supplier.name,
            category: supplier.category,
            description: supplier.description,
            hours: supplier.hours,
            location: supplier.location,
          }
        : {
            name: "",
            category: "Store",
            description: "",
            hours: "",
            location: "",
          },
    )
    setErrs({})
    setInitialized(key)
  }
  if (!open && initialized !== null) setInitialized(null)

  const set =
    (k: keyof typeof f) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) =>
      setF((s) => ({ ...s, [k]: e.target.value }))

  const save = () => {
    const e: Record<string, string> = {}
    if (!f.description.trim()) e.description = "Enter a description."
    if (!f.name.trim()) e.name = "Enter a supplier name."
    if (!f.location.trim()) e.location = "Enter a location."
    if (!f.hours.trim()) e.hours = "Enter operating hours."
    setErrs(e)
    if (Object.keys(e).length)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
    if (Object.keys(e).length) return
    onSave({
      id: supplier?.id,
      ...f,
      category: f.category as Supplier["category"],
    })
  }

  return (
    <Overlay open={open} onClose={onClose} side>
      <form className="supplier-editor flex flex-col h-full" onSubmit={event => { event.preventDefault(); save() }} noValidate>
        <div className="px-6 py-4 border-b border-[#EDEDEF] flex items-center justify-between">
          <h2 className="text-[18px] font-semibold">
            {supplier ? "Edit supplier" : "Create supplier"}
          </h2>
          <button
            type="button"
            aria-label="Close supplier form"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#F7F8F2] text-lg"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Field label="Name" error={errs.name}>
            <Input value={f.name} onChange={set("name")} error={!!errs.name} />
          </Field>
          <Field label="Category">
            <Select value={f.category} onChange={set("category")}>
              <option>Store</option>
              <option>Facility</option>
              <option>Campus Location</option>
            </Select>
          </Field>
          <Field label="Description" error={errs.description}>
            <Textarea value={f.description} onChange={set("description")} />
          </Field>
          <Field label="Operating hours" error={errs.hours}>
            <Input
              value={f.hours}
              onChange={set("hours")}
              placeholder="e.g. Mon–Fri 9:00–18:00"
              error={!!errs.hours}
            />
          </Field>
          <Field label="Location" error={errs.location}>
            <Input
              value={f.location}
              onChange={set("location")}
              error={!!errs.location}
            />
          </Field>
          <div className="rounded-md bg-[#F7F8F2] px-4 py-3 text-[13px] text-[#626E63]">
            Recorded by{" "}
            {supplier ? userNameHint(supplier) : currentUser.username} — set
            automatically and not editable.
          </div>
        </div>
        <div className="sheet-actions px-6 py-4 border-t border-[#EDEDEF] flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Overlay>
  )
}
function userNameHint(_s: Supplier) {
  return "the original creator"
}

/* ------- shared not-found ------- */
function NotFound({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <Card>
      <EmptyState
        title="Not found"
        body="This item may have been removed."
        action={<Button onClick={onBack}>{label}</Button>}
      />
    </Card>
  )
}

export function AdminUsers() {
  const { users, currentUser, setAdmin } = useStore()
  const [target, setTarget] = useState<string | null>(null)
  const user = users.find((u) => u.id === target)
  if (!currentUser.isAdminManager)
    return (
      <Page>
        <EmptyState
          title="Admin Manager access required"
          body="Only Admin Managers can assign or revoke administrator privileges."
        />
      </Page>
    )
  return (
    <Page wide>
      <PageHead
        title="Administrator access"
        subtitle="Manage supplier administration privileges. Every member can still request and deliver errands."
      />
      <div className="supplier-list">
        {users.map((u) => (
          <article className="user-row" key={u.id}>
            <div>
              <h2>{u.username}</h2>
              <p className="muted">{u.email}</p>
            </div>
            <div className="muted">
              {u.isAdminManager ? "Admin Manager · " : ""}
              {u.isAdmin ? "Administrator" : "Member"}
            </div>
            <Button variant="secondary" onClick={() => setTarget(u.id)}>
              {u.isAdmin ? "Revoke administrator" : "Make administrator"}
            </Button>
          </article>
        ))}
      </div>
      <Overlay
        open={!!user}
        onClose={() => setTarget(null)}
        title="Change administrator access"
      >
        <div className="p-6">
          <h2>{user?.isAdmin ? "Revoke" : "Grant"} administrator access?</h2>
          <p className="muted mt-3">
            {user?.username} will {user?.isAdmin ? "lose" : "gain"} permission
            to create, edit, and deactivate suppliers. Requester and courier
            access stays available.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Keep current access
            </Button>
            <Button
              onClick={() => {
                if (user && setAdmin(user.id, !user.isAdmin)) setTarget(null)
              }}
            >
              Confirm change
            </Button>
          </div>
        </div>
      </Overlay>
    </Page>
  )
}

export function AuditLog() {
  const { errands, txns, currentUser, nav, go } = useStore()
  const query = nav.params?.q ?? "",
    kind = nav.params?.kind ?? "all"
  if (!currentUser.isAdmin)
    return (
      <Page>
        <EmptyState
          title="Administrator access required"
          body="Sign in with an administrator account to view the activity log."
        />
      </Page>
    )
  const actions = errands.flatMap((e) =>
    e.activity.map((a, i) => ({
      id: `${e.id}-${i}`,
      order: e.id,
      actor: a.actorId,
      action: a.text,
      time: a.time,
      kind: "errand",
    })),
  )
  const credits = txns.map((t) => ({
    id: t.id,
    order: t.errandId ?? "Registration",
    actor: t.actorId,
    action: `${t.type}: ${t.amount} credits · account ${t.userId}`,
    time: t.time,
    kind: "credit",
  }))
  const entries = [...actions, ...credits]
    .filter(
      (a) =>
        (kind === "all" || a.kind === kind) &&
        `${a.order} ${a.actor} ${a.action}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
  return (
    <Page wide>
      <PageHead
        title="Activity log"
        subtitle="A record of errand actions and credit movements."
      />
      <div className="filter-row">
        <Field label="Find an entry">
          <Input
            type="search"
            value={query}
            placeholder="Search order, user, or action…"
            onChange={(e) => go("audit", { q: e.target.value, kind })}
          />
        </Field>
        <Field label="Record type">
          <Select
            value={kind}
            onChange={(e) => go("audit", { q: query, kind: e.target.value })}
          >
            <option value="all">All records</option>
            <option value="errand">Errand actions</option>
            <option value="credit">Credit transactions</option>
          </Select>
        </Field>
        <span className="result-count">{entries.length} records</span>
      </div>
      <p className="muted text-sm mb-5">
        Read-only demo records. Production retention and tamper protection are
        not connected in this prototype.
      </p>
      <div
        className="audit-scroll"
        tabIndex={0}
        aria-label="Scrollable activity records"
      >
        <table className="audit-table" role="table">
          <caption className="sr-only">Errand and credit activity</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">Timestamp</th>
              <th role="columnheader" scope="col">User ID</th>
              <th role="columnheader" scope="col">Order ID</th>
              <th role="columnheader" scope="col">Action</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {entries.map((a) => (
              <tr role="row" key={a.id}>
                <td role="cell" data-label="Time">
                  <time dateTime={a.time}>{formatTime(a.time)}</time>
                </td>
                <td role="cell" data-label="User">{a.actor}</td>
                <td role="cell" data-label="Order">
                  {a.order === "Registration" ? (
                    a.order
                  ) : (
                    <a
                      className="text-link"
                      href={routeHref("errand-details", { id: a.order })}
                    >
                      {a.order}
                    </a>
                  )}
                </td>
                <td role="cell" data-label="Action">{a.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!entries.length && (
        <EmptyState
          title="No matching records"
          body="Try a different order, user, or record type."
        />
      )}
    </Page>
  )
}

export function Operations() {
  const { currentUser } = useStore()
  const [failed, setFailed] = useState("")
  const [service, setService] = useState("all")
  const [events, setEvents] = useState<{
    id: number
    service: string
    time: string
    text: string
    level: string
  }[]>([])
  const services = [
    "User Service",
    "Supplier Service",
    "Order Service",
    "Credit Service",
  ]
  if (!currentUser.isAdmin)
    return (
      <Page>
        <EmptyState
          title="Administrator access required"
          body="Sign in as an administrator to explore the monitoring preview."
        />
      </Page>
    )
  const simulate = (next: string) => {
    const time = new Date().toISOString()
    setEvents((previous) => [
      ...(next
        ? [
            {
              id: Date.now(),
              service: next,
              time,
              text: "Health check failed. Administrator alert raised.",
              level: "Error",
            },
          ]
        : []),
      ...(failed
        ? [
            {
              id: Date.now() + 1,
              service: failed,
              time,
              text: "Health check recovered. Alert resolved.",
              level: "Info",
            },
          ]
        : []),
      ...previous,
    ])
    setFailed(next)
  }
  return (
    <Page wide>
      <PageHead
        title="Service monitoring"
        subtitle="Explore the team’s monitoring and centralised logging UI."
      />
      <div className="ce-surface p-5 mb-6">
        <p className="text-sm muted mb-4">
          Demo controls. These statuses and alerts are simulated; no running
          microservices are being monitored.
        </p>
        <Field label="Preview a service failure">
          <Select value={failed} onChange={(e) => simulate(e.target.value)}>
            <option value="">All services healthy</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div role="status" className="mb-5 text-sm">
        {failed
          ? `${failed} is unavailable. A sample alert has been raised. Restore the service using the demo control above.`
          : "No active alerts in this demo."}
      </div>
      <div className="supplier-list">
        {services.map((s) => (
          <div className="user-row" key={s}>
            <h2>{s}</h2>
            <span>{failed === s ? "Unavailable" : "Healthy"}</span>
            <span className="muted text-sm">Simulated health check</span>
          </div>
        ))}
      </div>
      <div className="section-line mt-8">
        <h2>Centralised logs</h2>
      </div>
      <div className="filter-row">
        <Field label="Filter service">
          <Select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="all">All services</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <ul className="notification-list">
        {events
          .filter((e) => service === "all" || e.service === service)
          .map((e) => (
            <li key={e.id}>
              <strong>
                {e.level} · {e.service}
              </strong>
              <p>{e.text}</p>
              <time dateTime={e.time}>{formatTime(e.time)}</time>
            </li>
          ))}
      </ul>
      {!events.filter((e) => service === "all" || e.service === service)
        .length && (
        <EmptyState
          title="No sample log entries"
          body="Preview a service failure above to see its alert and recovery records here."
        />
      )}
    </Page>
  )
}
