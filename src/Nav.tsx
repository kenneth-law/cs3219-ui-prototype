/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06.
 * Scope: Simplified responsive navigation. Human review pending. See /ai/usage-log.md. */
import { useState } from "react"
import { useStore, routeHref, formatTime, type Route } from "./store"
import { Button, Overlay } from "./ui"

export function Navbar() {
  const {
    nav,
    currentUser,
    role,
    setRole,
    signOut,
    notifications,
    markAllNotificationsRead,
  } = useStore()
  const [panel, setPanel] = useState<"account" | "notifications" | null>(null)
  const unread = notifications.filter((n) => !n.read).length
  const links: { label: string; route: Route }[] = [
    { label: "Errands", route: "browse" },
    { label: "My activity", route: "my-errands" },
    { label: "Campus places", route: "suppliers" },
  ]
  return (
    <>
      <header className="site-header">
        <div className="nav-top">
          <a href={routeHref("browse")} className="wordmark" translate="no">
            campus<span>errands.</span>
          </a>
          <nav aria-label="Main navigation" className="primary-nav">
            {links.map((l) => (
              <a
                key={l.route}
                href={routeHref(l.route)}
                aria-current={nav.route === l.route ? "page" : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <a className="balance-link" href={routeHref("credits")} aria-label={`${currentUser.available} available credits`}>
              <strong>{currentUser.available}</strong>
              <span> credits</span>
            </a>
            <button
              className="nav-notifications"
              onClick={() => setPanel("notifications")}
              aria-label={`Notifications, ${unread} unread`}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              {unread > 0 && <span className="notification-dot" />}
            </button>
            <button
              className="account-button"
              onClick={() => setPanel("account")}
              aria-label="Open account and role settings"
            >
              {currentUser.username.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>
        <div className="nav-context">
          <span>Small errands. A little help from campus.</span>
          <a href={routeHref("create")}>
            Request an errand <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <Overlay
        open={panel !== null}
        onClose={() => setPanel(null)}
        side
        title={panel === "account" ? "Your account" : "Notifications"}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center gap-4">
            <h2>{panel === "account" ? "Your account" : "Notifications"}</h2>
            <Button
              variant="ghost"
              onClick={() => setPanel(null)}
              aria-label="Close panel"
            >
              Close
            </Button>
          </div>
          {panel === "account" ? (
            <>
              <div>
                <strong className="block break-words">
                  {currentUser.username}
                </strong>
                <p className="muted break-words">{currentUser.email}</p>
              </div>
              <label className="block text-sm">
                Use campus errands as
                <select
                  className="role-select mt-2 w-full"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as typeof role)
                    setPanel(null)
                  }}
                >
                  <option value="requester">
                    Requester · ask for a pickup
                  </option>
                  <option value="courier">
                    Courier · help with a delivery
                  </option>
                </select>
              </label>
              <nav className="account-links" aria-label="Account navigation">
                <a href={routeHref("profile")}>Profile</a>
                <a href={routeHref("credits")}>Credits & transactions</a>
                {currentUser.isAdmin && (
                  <a href={routeHref("admin")}>Manage suppliers</a>
                )}
                {currentUser.isAdminManager && (
                  <a href={routeHref("admin-users")}>
                    Manage administrator access
                  </a>
                )}
                {currentUser.isAdmin && (
                  <a href={routeHref("audit")}>Errand & credit audit log</a>
                )}
                {currentUser.isAdmin && (
                  <a href={routeHref("operations")}>Service monitoring</a>
                )}
              </nav>
              <Button variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              {unread > 0 && (
                <Button variant="ghost" onClick={markAllNotificationsRead}>
                  Mark all as read
                </Button>
              )}
              {notifications.length === 0 ? (
                <p className="muted">
                  You’re all caught up. Updates on your errands will appear
                  here.
                </p>
              ) : (
                <ul className="notification-list">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <a
                        href={routeHref("errand-details", { id: n.errandId! })}
                        onClick={() => setPanel(null)}
                      >
                        <span>
                          {!n.read && <strong>New · </strong>}
                          {n.text}
                        </span>
                        <time>{formatTime(n.time)}</time>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </Overlay>
    </>
  )
}
