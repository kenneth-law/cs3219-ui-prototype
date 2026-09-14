/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06.
 * Scope: Prototype routing, access checks, accessible feedback. Human review pending; see /ai/usage-log.md. */
import React, { useEffect } from "react"
import { StoreProvider, useStore, ROUTE_LABELS, type Route } from "./store"
import {
  SignUp,
  SignIn,
  ForgotPassword,
  ResetPassword,
  Suppliers,
  SupplierDetails,
  CreateErrand,
  Browse,
  MyErrands,
  ErrandDetails,
  Profile,
  Credits,
  AdminSuppliers,
  AdminUsers,
  AuditLog,
  Operations,
} from "./routes"

const screens: Record<Route, () => React.JSX.Element> = {
  "sign-up": SignUp,
  "sign-in": SignIn,
  "forgot-password": ForgotPassword,
  "reset-password": ResetPassword,
  suppliers: Suppliers,
  "supplier-details": SupplierDetails,
  create: CreateErrand,
  browse: Browse,
  "my-errands": MyErrands,
  "errand-details": ErrandDetails,
  profile: Profile,
  credits: Credits,
  admin: AdminSuppliers,
  "admin-users": AdminUsers,
  audit: AuditLog,
  operations: Operations,
}
function Router() {
  const { nav, session, notice, clearNotice } = useStore()
  const route =
    !session && !["sign-in", "sign-up", "forgot-password", "reset-password"].includes(nav.route)
      ? "sign-in"
      : nav.route
  const Screen = screens[route]
  useEffect(() => {
    document.title = `${ROUTE_LABELS[route].replace(/^\d+ — /, "")} · Campus errands`
    document.getElementById("main-content")?.focus({ preventScroll: true })
  }, [route, nav.params?.id])
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {notice && (
        <div role="alert" className="notice">
          <span>{notice}</span>
          <button aria-label="Dismiss message" onClick={clearNotice}>
            Dismiss
          </button>
        </div>
      )}
      <Screen key={`${route}-${nav.params?.id ?? nav.params?.token ?? ""}`} />
    </>
  )
}
export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
