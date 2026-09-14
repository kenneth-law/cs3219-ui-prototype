/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06. UI styling and accessibility. Human review pending; see /ai/usage-log.md. */
import React, { useEffect, useRef, useId, useState } from "react"
import { useStore, statusLabel, type Status } from "./store"

export const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ")

// ---------- Button ----------
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "md" | "sm"
  full?: boolean
}
export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  href,
  ...p
}: BtnProps) {
  const base =
    "ce-button inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors select-none disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286749] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
  const sizes = size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-[15px]"
  const variants = {
    primary: "bg-[#286749] text-white hover:bg-[#24573F] active:bg-[#24573F]",
    secondary:
      "bg-white text-[#283A31] border border-[#D2D2D7] hover:bg-[#F7F8F2]",
    ghost: "text-[#286749] hover:bg-[#EAF0E3]",
    danger:
      "bg-white text-[#C6362E] border border-[#E7C3C0] hover:bg-[#FBF1F0]",
  }[variant]
  const classes = cx(base, sizes, variants, full && "w-full", className)
  if (href)
    return (
      <a href={href} className={classes}>
        {p.children}
      </a>
    )
  return <button type="button" className={classes} {...p} />
}

// ---------- Link (text) ----------
export function TextLink({
  className,
  href,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const classes = cx("text-link", className)
  return href ? (
    <a href={href} className={classes}>
      {p.children}
    </a>
  ) : (
    <button type="button" className={classes} {...p} />
  )
}

// ---------- Card ----------
export function Card({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ce-surface", className)} {...p} />
}

// ---------- Field / Input ----------
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id} className="block text-[13px] font-medium mb-1.5">
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id,
              name:
                (children.props as Record<string, unknown>).name ??
                label.toLowerCase().replace(/[^a-z]+/g, "-"),
              "aria-invalid": !!error,
              "aria-describedby": error || hint ? `${id}-help` : undefined,
            },
          )
        : children}
      {(error || hint) && (
        <span
          id={`${id}-help`}
          className={cx(
            "mt-1.5 block text-xs",
            error ? "text-[#C6362E]" : "muted",
          )}
          role={error ? "alert" : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}

const inputBase =
  "w-full h-11 px-3.5 rounded-md bg-white border text-[15px] text-[#283A31] placeholder:text-[#707A6C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286749] focus-visible:border-[#286749]"

export function Input({
  error,
  className,
  ...p
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      autoComplete="off"
      className={cx(
        inputBase,
        error ? "border-[#E7C3C0]" : "border-[#D2D2D7]",
        className,
      )}
      {...p}
    />
  )
}
export function Textarea({
  error,
  className,
  ...p
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      autoComplete="off"
      className={cx(
        inputBase.replace("h-11", "min-h-[96px] py-3"),
        error ? "border-[#E7C3C0]" : "border-[#D2D2D7]",
        className,
      )}
      {...p}
    />
  )
}
export function Select({
  className,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        inputBase,
        "border-[#D2D2D7] appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236E6E73%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[right_0.9rem_center] bg-no-repeat pr-10",
        className,
      )}
      {...p}
    />
  )
}

// ---------- Password input ----------
export function PasswordInput({
  error,
  ...p
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        error={error}
        className="pr-16"
        {...p}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#626E63] hover:text-[#283A31]"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  )
}

// ---------- Status chip ----------
const statusStyles: Record<Status, string> = {
  Open: "bg-[#EAF0E3] text-[#24573F]",
  Accepted: "bg-[#EAF2FB] text-[#2B5F8A]",
  "In Transit": "bg-[#FBF3E3] text-[#8A6414]",
  Delivered: "bg-[#EDE9FB] text-[#5B4B9E]",
  Completed: "bg-[#E5F4E8] text-[#248A3D]",
  Cancelled: "bg-[#F1F1F3] text-[#626E63]",
  Expired: "bg-[#FBF1F0] text-[#C6362E]",
}
export function StatusChip({ status }: { status: Status }) {
  return (
    <span
      className={cx(
        "status-label inline-flex items-center gap-1.5 text-[12px] font-medium",
        statusStyles[status],
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  )
}

// ---------- Credits pill ----------
export function CreditPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#24573F] tabular-nums">
      {children}
    </span>
  )
}

// ---------- Pagination ----------
export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
}) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-label={`Page ${n}`}
          aria-current={n === page ? "page" : undefined}
          onClick={() => onPage(n)}
          className={cx(
            "h-9 min-w-9 px-3 rounded-md text-sm font-medium transition-colors",
            n === page
              ? "bg-[#286749] text-white"
              : "bg-white border border-[#D2D2D7] text-[#283A31] hover:bg-[#F7F8F2]",
          )}
        >
          {n}
        </button>
      ))}
      <Button
        size="sm"
        variant="secondary"
        disabled={page === pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

export function usePaged<T>(items: T[], perPage: number) {
  const { nav, go } = useStore()
  const pages = Math.max(1, Math.ceil(items.length / perPage))
  const requested = Number(nav.params?.page ?? 1)
  const page = Math.min(pages, Math.max(1, Number.isInteger(requested) ? requested : 1))
  const setPage = (next: number) => go(nav.route, { ...nav.params, page: String(next) })
  return { slice: items.slice((page - 1) * perPage, page * perPage), page, pages, setPage }
}

// ---------- Empty state ----------
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-14 px-6">
      <h3 className="text-[15px] font-semibold text-[#283A31]">{title}</h3>
      <p className="mt-1 text-sm text-[#626E63] max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

// ---------- Spinner ----------
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block ce-spin rounded-full border-2 border-[#D2D2D7] border-t-[#286749]",
        className || "w-4 h-4",
      )}
    />
  )
}

// ---------- Section heading ----------
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#626E63]">
      {children}
    </div>
  )
}

// ---------- Overlay (modal / sheet) ----------
export function Overlay({
  open,
  onClose,
  children,
  side,
  title = "Confirm action",
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: boolean
  title?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const previous = document.activeElement as HTMLElement | null
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={cx("ce-dialog", side && "ce-drawer")}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div>{open && children}</div>
    </dialog>
  )
}

// Warn when an in-progress form would be lost on reload or closing the window.
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
}
