/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06. Prototype regression tests. Human review pending; see /ai/usage-log.md. */
import { JSDOM } from "jsdom"
import assert from "node:assert/strict"
import React, { act } from "react"
import { StoreProvider, useStore } from "../src/store"
import App from "../src/App"
import {
  getByRole,
  getByLabelText,
  fireEvent,
  queryByRole,
} from "@testing-library/dom"
const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  url: "http://localhost:8443",
})
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  HTMLDialogElement: dom.window.HTMLDialogElement,
  IS_REACT_ACT_ENVIRONMENT: true,
  requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0),
})
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })
// React DOM must detect browser input support after JSDOM is installed.
const { createRoot } = await import("react-dom/client")
const browserErrors: unknown[] = []
dom.window.addEventListener("error", event => browserErrors.push(event.error))
dom.window.scrollTo = () => {}
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true
}
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false
}
let store: ReturnType<typeof useStore>
function Capture() {
  store = useStore()
  return null
}
const root = createRoot(document.getElementById("root")!)
await act(async () =>
  root.render(
    <StoreProvider>
      <Capture />
    </StoreProvider>,
  ),
)
const run = async (fn: () => void) => act(async () => fn())
const total = () =>
  store.users.reduce((n, u) => n + u.available + u.reserved, 0)
await run(() => assert.equal(store.signIn("alex@campus.edu", "wrong"), false))
await run(() =>
  assert.equal(store.signUp("new", "new@campus.edu", "lowercase1"), false),
)
await run(() =>
  assert.equal(store.signUp("alexchen", "new@campus.edu", "Goodpass1"), false),
)
await run(() =>
  assert.equal(store.signUp("new", "new@campus.edu", "Goodpass1"), true),
)
assert.equal(store.currentUser.available, 100)
assert.equal(
  store.txns.filter(
    (t) => t.userId === store.currentUser.id && t.type === "Initial allocation",
  ).length,
  1,
)
const newId = store.currentUser.id
await run(() => store.signIn("alex@campus.edu", "Passw0rd!"))
const baseTotal = total(),
  supplier = store.suppliers[0]
const data = {
  pickup: `${supplier.name} — ${supplier.location}`,
  delivery: "PGP lobby",
  details: "Lecture notes",
  credits: 7,
}
await run(() => assert.equal(store.createErrand({ ...data, credits: 1.5 }), ""))
await run(() =>
  assert.equal(store.createErrand({ ...data, credits: 100000 }), ""),
)
let id = ""
await run(() => {
  id = store.createErrand(data)
})
assert.ok(id)
assert.ok(
  Math.abs(Date.parse(store.errandById(id)!.expiresAt) - Date.now() - 900000) <
    2000,
)
await run(() => assert.equal(store.acceptErrand(id), false))
await run(() => assert.equal(store.deleteSupplier(supplier.id), false))
await run(() => store.signIn("priya@campus.edu", "Passw0rd!"))
await run(() => {
  assert.equal(store.acceptErrand(id), true)
  assert.equal(store.acceptErrand(id), false)
})
await run(() => assert.equal(store.advanceErrand(id, "Completed"), false))
await run(() => assert.equal(store.advanceErrand(id, "In Transit"), true))
await run(() => assert.equal(store.advanceErrand(id, "Delivered"), true))
await run(() => store.signIn("alex@campus.edu", "Passw0rd!"))
await run(() => {
  assert.equal(store.advanceErrand(id, "Completed"), true)
  assert.equal(store.advanceErrand(id, "Completed"), false)
})
assert.equal(total(), baseTotal)
assert.equal(
  store.txns.filter((t) => t.errandId === id && t.type === "Receipt").length,
  1,
)
assert.equal(store.errandById(id)!.activity.length, 5)
let cancelled = ""
const availableBefore = store.currentUser.available
await run(() => {
  cancelled = store.createErrand(data)
})
await run(() => {
  assert.equal(store.cancelErrand(cancelled), true)
  assert.equal(store.cancelErrand(cancelled), false)
})
assert.equal(store.currentUser.available, availableBefore)
let expired = ""
await run(() => {
  expired = store.createErrand(data)
})
const originalNow = Date.now
Date.now = () => originalNow() + 901000
await run(() => dom.window.dispatchEvent(new dom.window.Event("focus")))
Date.now = originalNow
assert.equal(store.errandById(expired)!.status, "Expired")
assert.equal(total(), baseTotal)
assert.equal(store.users.find((u) => u.id === "u1")!.reserved, 20)
await run(() => assert.equal(store.setAdmin(newId, true), true))
await run(() =>
  assert.equal(
    store.saveSupplier({
      name: "Test pickup",
      category: "Facility",
      description: "Demo",
      hours: "9–5",
      location: "COM3",
    }),
    true,
  ),
)
const added = store.suppliers.at(-1)!
assert.equal(added.creatorId, "u1")
await run(() => assert.equal(store.deleteSupplier(added.id), true))
assert.equal(store.supplierById(added.id)!.active, false)
await run(() => store.signIn("priya@campus.edu", "Passw0rd!"))
await run(() => assert.equal(store.setAdmin(newId, false), false))
await run(() => assert.equal(store.deleteSupplier(added.id), false))
await run(() =>
  assert.equal(store.updateProfile("alexchen", "other@campus.edu"), false),
)
await run(() =>
  assert.equal(
    store.updateProfile("priya.updated", "updated@campus.edu"),
    true,
  ),
)
assert.equal(store.currentUser.username, "priya.updated")
const resetBalance = total()
let resetToken = ""
await run(() => { resetToken = store.requestPasswordReset(" NEW@campus.edu ") })
assert.ok(store.isResetLinkValid(resetToken))
await run(() => assert.equal(store.resetPassword(resetToken, "weak", "weak"), false))
await run(() => assert.equal(store.resetPassword(resetToken, "A".repeat(64) + "a1", "A".repeat(64) + "a1"), false))
await run(() => assert.equal(store.resetPassword(resetToken, "Newpass123", "Different123"), false))
assert.ok(store.isResetLinkValid(resetToken))
await run(() => assert.equal(store.resetPassword(resetToken, "Newpass123", "Newpass123"), true))
assert.equal(store.session, null)
assert.equal(total(), resetBalance)
await run(() => assert.equal(store.signIn("new@campus.edu", "Goodpass1"), false))
await run(() => assert.equal(store.signIn("new@campus.edu", "Newpass123"), true))
await run(() => assert.equal(store.resetPassword(resetToken, "Againpass1", "Againpass1"), false))
let replacedToken = ""
await run(() => { replacedToken = store.requestPasswordReset("new@campus.edu") })
await run(() => { resetToken = store.requestPasswordReset("new@campus.edu") })
assert.equal(store.isResetLinkValid(replacedToken), false)
const resetNow = Date.now
Date.now = () => resetNow() + 900001
assert.equal(store.isResetLinkValid(resetToken), false)
await run(() => assert.equal(store.resetPassword(resetToken, "Againpass1", "Againpass1"), false))
Date.now = resetNow
await run(() => { resetToken = store.requestPasswordReset("unknown@campus.edu") })
assert.ok(resetToken)
assert.equal(store.isResetLinkValid(resetToken), false)
await run(() => assert.equal(store.resetPassword(resetToken, "Againpass1", "Againpass1"), false))
console.log("PASS: password reset changes login credentials, preserves credits, validates password/confirmation, rejects used/expired/replaced/unknown links, and ends the session.")
await act(async () => root.unmount())
console.log(
  "PASS: account validation, welcome credits, credit guards, self-acceptance, supplier guard, repeated actions, lifecycle permissions, credit conservation, cancellation, expiry, administrator permissions, soft deletion, profile uniqueness.",
)
const appRoot = createRoot(document.getElementById("root")!)
dom.window.location.hash = "#/sign-in"
await act(async () => appRoot.render(<App />))
const body = document.body
assert.ok(getByRole(body, "link", { name: "Forgot password?" }))
await run(() => { dom.window.location.hash = "#/forgot-password?email=marcus%40campus.edu"; dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange")) })
await run(() => fireEvent.submit(getByRole(body, "button", { name: "Request reset link" }).closest("form")!))
assert.ok(getByRole(body, "heading", { name: "Check your email" }))
const demoResetHref = getByRole(body, "link", { name: "Open demo reset link" }).getAttribute("href")!
await run(() => { dom.window.location.hash = demoResetHref; dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange")) })
assert.ok(getByLabelText(body, "New password"))
assert.ok(getByLabelText(body, "Confirm new password"))
await run(() => fireEvent.submit(getByRole(body, "button", { name: "Reset password" }).closest("form")!))
assert.ok(body.querySelector('[aria-invalid="true"]'))
await run(() => fireEvent.change(getByLabelText(body, "New password"), { target: { value: "Updatedpass123" } }))
await run(() => fireEvent.change(getByLabelText(body, "Confirm new password"), { target: { value: "Updatedpass123" } }))
await run(() => fireEvent.submit(getByRole(body, "button", { name: "Reset password" }).closest("form")!))
assert.ok(getByRole(body, "heading", { name: "Password updated" }))
await run(() => { dom.window.location.hash = "#/reset-password?token=invalid"; dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange")) })
assert.ok(getByRole(body, "heading", { name: "Link unavailable" }))
await run(() => { dom.window.location.hash = "#/sign-in"; dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange")) })
console.log("PASS: signed-out recovery navigation, demo link, new-password fields, inline validation, and invalid-link screen.")

await run(() =>
  fireEvent.click(
    getByRole(body, "button", {
      name: "Alex · Admin Manager & administrator",
      hidden: true,
    }),
  ),
)
await run(() =>
  fireEvent.submit(
    getByRole(body, "button", { name: "Sign In" }).closest("form")!,
  ),
)
assert.ok(getByRole(body, "heading", { name: "A little help, on your way." }))
assert.equal(queryByRole(body, "tab"), null)
assert.ok(getByRole(body, "link", { name: "My activity" }))
await run(() => {
  dom.window.location.hash = "#/create"
  dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
})
await run(() =>
  fireEvent.submit(
    getByRole(body, "button", { name: "Create Request" }).closest("form")!,
  ),
)
assert.ok(body.querySelector('[aria-invalid="true"]'))
assert.ok(getByLabelText(body, "Delivery location"))
await run(() => {
  dom.window.location.hash = "#/admin-users"
  dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
})
assert.ok(getByRole(body, "heading", { name: "Administrator access" }))
await run(() => {
  dom.window.location.hash = "#/audit"
  dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
})
assert.ok(getByRole(body, "table"))
for (const route of [
  "suppliers",
  "supplier-details?id=s1",
  "my-errands",
  "errand-details?id=e2",
  "profile",
  "credits",
  "admin",
  "operations",
  "sign-up",
]) {
  await run(() => {
    dom.window.location.hash = "#/" + route
    dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
  })
  assert.ok(body.querySelector("main"), `Main landmark for ${route}`)
  assert.ok(body.querySelector("h1"), `Page heading for ${route}`)
}
await run(() => {
  dom.window.location.hash = "#/operations"
  dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
})
await run(() =>
  fireEvent.change(getByLabelText(body, "Preview a service failure"), {
    target: { value: "Credit Service" },
  }),
)
assert.match(
  getByRole(body, "status").textContent!,
  /Credit Service is unavailable/,
)
await run(() =>
  fireEvent.change(getByLabelText(body, "Preview a service failure"), {
    target: { value: "" },
  }),
)
assert.match(getByRole(body, "status").textContent!, /No active alerts/)
await run(() => {
  dom.window.location.hash = "#/admin"
  dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"))
})
await run(() =>
  fireEvent.click(getByRole(body, "button", { name: "Create Supplier" })),
)
assert.ok(getByRole(body, "dialog"))
assert.ok(getByLabelText(body, "Operating hours"))
await run(() =>
  fireEvent.click(getByRole(body, "button", { name: "Close supplier form" })),
)
assert.equal(queryByRole(body, "dialog"), null)
console.log(
  "PASS: all screens render; monitoring failure/recovery and supplier dialog open/close work.",
)
await act(async () => appRoot.unmount())
console.log(
  "PASS: rendered sign-in, noticeboard, navigation, form validation, administrator page and audit table.",
)

assert.deepEqual(browserErrors, [], "No uncaught errors in rendered UI interactions")
dom.window.close()
