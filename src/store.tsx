/* AI Assistance Disclosure: OpenAI Codex (GPT-6), 2026-09-06.
 * Scope: Interactive UI prototype implementation. Human review pending. See /ai/usage-log.md. */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

// ---------- Types ----------
export type Status = "Open" | "Accepted" | "In Transit" | "Delivered" | "Completed" | "Cancelled" | "Expired"

export type User = {
  id: string
  username: string
  email: string
  password: string
  isAdminManager?: boolean
  isAdmin: boolean
  available: number
  reserved: number
}

export type Supplier = {
  id: string
  name: string
  category: "Store" | "Facility" | "Campus Location"
  description: string
  hours: string
  location: string
  active?: boolean
  creatorId: string
}

export type Activity = {
  actorId: string
  text: string
  time: string
}

export type Message = {
  id: string
  senderId: string
  text: string
  time: string
}

export type Errand = {
  id: string
  requesterId: string
  courierId: string | null
  supplierId?: string
  pickup: string
  delivery: string
  details: string
  credits: number
  status: Status
  createdAt: string
  expiresAt: string
  activity: Activity[]
  messages: Message[]
}

export type Txn = {
  userId: string
  actorId: string
  id: string
  type: "Initial allocation" | "Reservation" | "Release" | "Transfer" | "Receipt"
  amount: number
  errandId?: string
  time: string
  note: string
}

export type Notification = {
  userId?: string
  id: string
  kind: "status" | "expiry" | "credit" | "chat"
  text: string
  errandId?: string
  read: boolean
  time: string
}

// ---------- Sample data ----------
const now = "Sep 1, 2026"

const users: User[] = [
  {
    id: "u1",
    username: "alexchen",
    email: "alex@campus.edu",
    password: "Passw0rd!",
    isAdminManager: true,
    isAdmin: true,
    available: 120,
    reserved: 55,
  },
  {
    id: "u2",
    username: "priya.n",
    email: "priya@campus.edu",
    password: "Passw0rd!",
    isAdmin: false,
    available: 80,
    reserved: 0,
  },
  {
    id: "u3",
    username: "marcus.lee",
    email: "marcus@campus.edu",
    password: "Passw0rd!",
    isAdmin: false,
    available: 60,
    reserved: 25,
  },
  {
    id: "u4",
    username: "sofia.r",
    email: "sofia@campus.edu",
    password: "Passw0rd!",
    isAdmin: false,
    available: 95,
    reserved: 0,
  },
]

const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "FairPrice Xpress",
    category: "Store",
    description: "Everyday essentials, snacks, and drinks in University Town.",
    hours: "Mon–Sat 8:00–22:00",
    location: "UTown, Stephen Riady Centre",
    creatorId: "u1",
  },
  {
    id: "s2",
    name: "Central Library",
    category: "Facility",
    description:
      "Main campus library with study rooms and a reserved-item pickup desk.",
    hours: "Daily 7:00–24:00",
    location: "Kent Ridge Crescent",
    creatorId: "u1",
  },
  {
    id: "s3",
    name: "CoffeeBean@COM3",
    category: "Store",
    description:
      "Coffee, pastries, and quick pickups between computing lectures.",
    hours: "Daily 7:00–19:00",
    location: "COM3, Level 1",
    creatorId: "u3",
  },
  {
    id: "s4",
    name: "PGP Parcel Collection",
    category: "Facility",
    description:
      "Central parcel pickup and outgoing mail services for all residence halls.",
    hours: "Mon–Fri 9:00–18:00",
    location: "Prince George’s Park, Block 2",
    creatorId: "u1",
  },
  {
    id: "s5",
    name: "PGP Foyer",
    category: "Campus Location",
    description: "A meeting and collection point for students at PGP.",
    hours: "Daily 7:30–21:00",
    location: "Prince George’s Park Residences",
    creatorId: "u4",
  },
  {
    id: "s6",
    name: "NUS Co-op",
    category: "Store",
    description:
      "Campus electronics and accessories counter with device pickup.",
    hours: "Mon–Fri 10:00–17:00",
    location: "Central Library, Level 1",
    creatorId: "u1",
  },
  {
    id: "s7",
    name: "Printers@PC Commons",
    category: "Campus Location",
    description: "Collect printed lecture notes and documents from PC Commons.",
    hours: "Daily 6:00–23:00",
    location: "COM1, PC Commons",
    creatorId: "u3",
  },
]

const errands: Errand[] = [
  {
    id: "e1",
    requesterId: "u1",
    courierId: null,
    pickup: "FairPrice Xpress — UTown, Stephen Riady Centre",
    delivery: "Tembusu College, lobby",
    details:
      "Grab a bottle of water and a sandwich, leave at the front desk if I'm not in.",
    credits: 15,
    status: "Open",
    createdAt: now,
    expiresAt: "Sep 1, 20:00",
    activity: [
      {
        actorId: "u1",
        text: "created the request and reserved 15 credits",
        time: "Sep 1, 09:12",
      },
    ],
    messages: [],
  },
  {
    id: "e2",
    requesterId: "u1",
    courierId: "u3",
    pickup: "PGP Parcel Collection — Prince George’s Park, Block 2",
    delivery: "PGP, Block 8 lobby",
    details: "Two small packages under my name, ID on file.",
    credits: 20,
    status: "Delivered",
    createdAt: "Aug 31",
    expiresAt: "Sep 1, 12:00",
    activity: [
      {
        actorId: "u1",
        text: "created the request and reserved 20 credits",
        time: "Aug 31, 15:00",
      },
      { actorId: "u3", text: "accepted the request", time: "Aug 31, 15:20" },
      { actorId: "u3", text: "marked as picked up", time: "Aug 31, 16:05" },
      { actorId: "u3", text: "marked as delivered", time: "Aug 31, 16:40" },
    ],
    messages: [
      {
        id: "m1",
        senderId: "u3",
        text: "Picked up both packages, on my way.",
        time: "16:06",
      },
      { id: "m2", senderId: "u1", text: "Thanks so much!", time: "16:07" },
    ],
  },
  {
    id: "e3",
    requesterId: "u2",
    courierId: null,
    pickup: "CoffeeBean@COM3 — COM3, Level 1",
    delivery: "Library study room 3B",
    details: "One large oat latte, no sugar. Meet at the room.",
    credits: 12,
    status: "Open",
    createdAt: now,
    expiresAt: "Sep 1, 15:00",
    activity: [
      {
        actorId: "u2",
        text: "created the request and reserved 12 credits",
        time: "Sep 1, 10:02",
      },
    ],
    messages: [],
  },
  {
    id: "e4",
    requesterId: "u4",
    courierId: null,
    pickup: "PGP Foyer — Prince George’s Park Residences",
    delivery: "Kent Ridge Hall, lobby",
    details: "A to-go dinner box, vegetarian option please.",
    credits: 18,
    status: "Open",
    createdAt: now,
    expiresAt: "Sep 1, 19:30",
    activity: [
      {
        actorId: "u4",
        text: "created the request and reserved 18 credits",
        time: "Sep 1, 11:15",
      },
    ],
    messages: [],
  },
  {
    id: "e5",
    requesterId: "u3",
    courierId: "u1",
    pickup: "NUS Co-op — Central Library, Level 1",
    delivery: "COM3, study area",
    details: "Pick up a reserved USB-C hub at the counter.",
    credits: 25,
    status: "Accepted",
    createdAt: now,
    expiresAt: "Sep 1, 17:00",
    activity: [
      {
        actorId: "u3",
        text: "created the request and reserved 25 credits",
        time: "Sep 1, 08:30",
      },
      { actorId: "u1", text: "accepted the request", time: "Sep 1, 09:40" },
    ],
    messages: [
      {
        id: "m3",
        senderId: "u3",
        text: "It's under Marcus at the NUS Co-op counter.",
        time: "09:41",
      },
    ],
  },
  {
    id: "e6",
    requesterId: "u2",
    courierId: "u1",
    pickup: "Central Library — Kent Ridge Crescent",
    delivery: "UTown Green, north bench",
    details: "Reserved book pickup, hold desk.",
    credits: 10,
    status: "In Transit",
    createdAt: now,
    expiresAt: "Sep 1, 18:00",
    activity: [
      {
        actorId: "u2",
        text: "created the request and reserved 10 credits",
        time: "Sep 1, 09:00",
      },
      { actorId: "u1", text: "accepted the request", time: "Sep 1, 09:30" },
      { actorId: "u1", text: "marked as picked up", time: "Sep 1, 10:10" },
    ],
    messages: [
      {
        id: "m4",
        senderId: "u1",
        text: "Got the book, heading to the quad now.",
        time: "10:11",
      },
    ],
  },
  {
    id: "e7",
    requesterId: "u4",
    courierId: "u2",
    pickup: "FairPrice Xpress — UTown, Stephen Riady Centre",
    delivery: "RC4, lobby",
    details: "Umbrella and a pack of pens.",
    credits: 14,
    status: "Completed",
    createdAt: "Aug 30",
    expiresAt: "Aug 30, 20:00",
    activity: [
      {
        actorId: "u4",
        text: "created the request and reserved 14 credits",
        time: "Aug 30, 12:00",
      },
      { actorId: "u2", text: "accepted the request", time: "Aug 30, 12:20" },
      { actorId: "u2", text: "marked as picked up", time: "Aug 30, 12:40" },
      { actorId: "u2", text: "marked as delivered", time: "Aug 30, 13:05" },
      {
        actorId: "u4",
        text: "marked as completed — 14 credits transferred to priya.n",
        time: "Aug 30, 13:10",
      },
    ],
    messages: [],
  },
  {
    id: "e8",
    requesterId: "u3",
    courierId: null,
    pickup: "Printers@PC Commons — COM1, PC Commons",
    delivery: "Eusoff Hall, lobby",
    details: "Checked-out yoga mat return pickup.",
    credits: 8,
    status: "Expired",
    createdAt: "Aug 29",
    expiresAt: "Aug 29, 20:00",
    activity: [
      {
        actorId: "u3",
        text: "created the request and reserved 8 credits",
        time: "Aug 29, 14:00",
      },
      {
        actorId: "u3",
        text: "request expired — 8 credits released",
        time: "Aug 29, 20:00",
      },
    ],
    messages: [],
  },
]

// ---------- Route ----------
export type Route = "forgot-password" | "reset-password" | "sign-up" | "sign-in" | "suppliers" | "supplier-details" | "create" | "browse" | "my-errands" | "errand-details" | "profile" | "credits" | "admin" | "admin-users" | "audit" | "operations"

export const ROUTE_LABELS: Record<Route, string> = {
  "forgot-password": "Forgot password",
  "reset-password": "Reset password",
  "sign-up": "01 — Sign Up",
  "sign-in": "02 — Sign In",
  suppliers: "03 — Suppliers",
  "supplier-details": "04 — Supplier Details",
  create: "05 — Create Errand",
  browse: "06 — Browse Errands",
  "my-errands": "07 — My Errands",
  "errand-details": "08 — Errand Details / Tracking",
  profile: "09 — Profile",
  credits: "10 — Credits",
  admin: "Supplier management",
  "admin-users": "User privileges",
  audit: "Activity log",
  operations: "Service monitoring",
}

// ---------- Interactive prototype state (not a backend) ----------
export type Nav = { route: Route; params?: Record<string, string> }
export const routeHref = (route: Route, params?: Record<string, string>) =>
  `#/${route}${
    params && Object.keys(params).length
      ? `?${new URLSearchParams(params)}`
      : ""
  }`
function readNav(): Nav {
  const [path, query] = window.location.hash.slice(2).split("?")
  return {
    route: path in ROUTE_LABELS ? path as Route : "sign-in",
    params: Object.fromEntries(new URLSearchParams(query)),
  }
}
export const statusLabel = (s: Status) =>
  (({
    Accepted: "To be picked up",
    "In Transit": "Picked up",
    Completed: "Received",
  }) as Partial<Record<Status, string>>)[s] ?? s
export const formatTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-SG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
}
export const activeErrand = (e: Errand) =>
  !["Completed", "Cancelled", "Expired"].includes(e.status)

type State = {
  users: User[]
  suppliers: Supplier[]
  errands: Errand[]
  txns: Txn[]
  notifications: Notification[]
  session: string | null
  role: "requester" | "courier"
}
type Store = State & {
  currentUser: User
  nav: Nav
  clock: number
  notice: string
  go: (route: Route, params?: Record<string, string>) => void
  clearNotice: () => void
  signIn: (email: string, password: string) => boolean
  signUp: (username: string, email: string, password: string) => boolean
  requestPasswordReset: (email: string) => string
  isResetLinkValid: (token: string) => boolean
  resetPassword: (token: string, password: string, confirmation: string) => boolean
  signOut: () => void
  setRole: (role: "requester" | "courier") => void
  setAdmin: (id: string, value: boolean) => boolean
  supplierById: (id?: string) => Supplier | undefined
  errandById: (id?: string) => Errand | undefined
  userById: (id?: string) => User | undefined
  createErrand: (data: {
    pickup: string
    delivery: string
    details: string
    credits: number
  }) => string
  acceptErrand: (id: string) => boolean
  advanceErrand: (id: string, to: Status) => boolean
  cancelErrand: (id: string) => boolean
  sendMessage: (id: string, text: string) => boolean
  updateProfile: (username: string, email: string) => boolean
  saveSupplier: (data: Partial<Supplier>) => boolean
  deleteSupplier: (id: string) => boolean
  markAllNotificationsRead: () => void
}
const Ctx = createContext<Store | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error("useStore outside provider")
  return s
}
const nextId = (p: string) => `${p}-${crypto.randomUUID()}`
const timestamp = () => new Date().toISOString()
const pickupName = (s: Supplier) => `${s.name} — ${s.location}`
function initialState(): State {
  const start = Date.now()
  const seeded = errands.map((e, i) => ({
    ...e,
    supplierId: suppliers.find((s) => pickupName(s) === e.pickup)?.id,
    createdAt: new Date(start - (i + 1) * 60000).toISOString(),
    expiresAt: new Date(start + (15 - i - 1) * 60000).toISOString(),
    activity: e.activity.map((a, j) => ({
      ...a,
      time: new Date(start - (e.activity.length - j) * 60000).toISOString(),
    })),
  }))
  const people = users.map((u) => {
    const reserved = seeded
      .filter((e) => e.requesterId === u.id && activeErrand(e))
      .reduce((n, e) => n + e.credits, 0)
    const earned = seeded
      .filter((e) => e.courierId === u.id && e.status === "Completed")
      .reduce((n, e) => n + e.credits, 0)
    const spent = seeded
      .filter((e) => e.requesterId === u.id && e.status === "Completed")
      .reduce((n, e) => n + e.credits, 0)
    return { ...u, reserved, available: 100 - reserved + earned - spent }
  })
  const ledger: Txn[] = people.map((u) => ({
    id: nextId("t"),
    userId: u.id,
    actorId: "system",
    type: "Initial allocation",
    amount: 100,
    time: new Date(start - 86400000).toISOString(),
    note: "Welcome allocation",
  }))
  seeded.forEach((e) => {
    ledger.push({
      id: nextId("t"),
      userId: e.requesterId,
      actorId: e.requesterId,
      type: "Reservation",
      amount: -e.credits,
      errandId: e.id,
      time: e.createdAt,
      note: "Reserved for this request",
    })
    if (["Expired", "Cancelled"].includes(e.status))
      ledger.push({
        id: nextId("t"),
        userId: e.requesterId,
        actorId: "system",
        type: "Release",
        amount: e.credits,
        errandId: e.id,
        time: e.createdAt,
        note: "Returned to available balance",
      })
    if (e.status === "Completed") {
      ledger.push({
        id: nextId("t"),
        userId: e.requesterId,
        actorId: e.requesterId,
        type: "Transfer",
        amount: -e.credits,
        errandId: e.id,
        time: e.createdAt,
        note: "Paid from reserved credits",
      })
      ledger.push({
        id: nextId("t"),
        userId: e.courierId!,
        actorId: e.requesterId,
        type: "Receipt",
        amount: e.credits,
        errandId: e.id,
        time: e.createdAt,
        note: "Earned for delivery",
      })
    }
  })
  return {
    users: people,
    suppliers: suppliers.map((s) => ({ ...s, active: true })),
    errands: seeded,
    txns: ledger.reverse(),
    notifications: [],
    session: null,
    role: "requester",
  }
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Local demo links only. No email or password-recovery service is connected.
  const resetLinks = useRef(new Map<string, { email: string; userId?: string; expiresAt: number }>())
  const [state, setState] = useState(initialState)
  const ref = useRef(state)
  const [nav, setNav] = useState<Nav>(readNav)
  const [clock, setClock] = useState(Date.now())
  const [notice, setNotice] = useState("")
  // Commit each prototype action synchronously to prevent repeated clicks from using stale state.
  const commit = (update: (draft: State) => void) => {
    const draft = structuredClone(ref.current)
    update(draft)
    ref.current = draft
    setState(draft)
  }
  const go = (route: Route, params?: Record<string, string>) => {
    window.location.hash = routeHref(route, params)
    setNav({ route, params })
    setNotice("")
    if (route !== nav.route) window.scrollTo({ top: 0 })
  }
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#main-content") return
      setNav(readNav())
      setNotice("")
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])
  const record = (d: State, e: Errand, actorId: string, text: string) => {
    e.activity.push({ actorId, text, time: timestamp() })
    for (const userId of new Set(
      [e.requesterId, e.courierId].filter(Boolean),
    )) {
      d.notifications.unshift({
        id: nextId("n"),
        userId: userId!,
        kind: "status",
        text: `${e.pickup.split(" — ")[0]}: ${text}`,
        errandId: e.id,
        read: false,
        time: timestamp(),
      })
    }
  }
  const transaction = (
    d: State,
    e: Errand,
    userId: string,
    actorId: string,
    type: Txn["type"],
    amount: number,
    note: string,
  ) => {
    d.txns.unshift({
      id: nextId("t"),
      userId,
      actorId,
      type,
      amount,
      note,
      time: timestamp(),
      errandId: e.id,
    })
  }
  const release = (
    d: State,
    e: Errand,
    status: "Cancelled" | "Expired",
    actorId: string,
  ) => {
    const u = d.users.find((u) => u.id === e.requesterId)!
    u.reserved -= e.credits
    u.available += e.credits
    e.status = status
    record(
      d,
      e,
      actorId,
      `${status.toLowerCase()} the request; ${e.credits} credits released`,
    )
    transaction(
      d,
      e,
      u.id,
      actorId,
      "Release",
      e.credits,
      `Released after ${status.toLowerCase()}`,
    )
  }
  const expire = () => {
    const now = Date.now()
    if (
      ref.current.errands.some(
        (e) => e.status === "Open" && Date.parse(e.expiresAt) <= now,
      )
    ) {
      commit((d) => {
        d.errands.forEach((e) => {
          if (e.status === "Open" && Date.parse(e.expiresAt) <= now)
            release(d, e, "Expired", "system")
        })
      })
    }
  }
  useEffect(() => {
    const tick = () => {
      expire()
      setClock(Date.now())
    }
    const interval = window.setInterval(tick, 250)
    window.addEventListener("focus", tick)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", tick)
    }
  }, [])
  const fail = (message: string) => {
    setNotice(message)
    return false
  }
  const actor = () =>
    ref.current.users.find((u) => u.id === ref.current.session)
  const accountError = (username: string, email: string, except?: string) => {
    if (!username.trim()) return "Enter a username."
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return "Enter a valid email address."
    if (
      ref.current.users.some(
        (u) =>
          u.id !== except &&
          u.username.toLowerCase() === username.trim().toLowerCase(),
      )
    )
      return "That username is already taken. Choose another."
    if (
      ref.current.users.some(
        (u) =>
          u.id !== except &&
          u.email.toLowerCase() === email.trim().toLowerCase(),
      )
    )
      return "That email is already registered. Use another email."
    return ""
  }
  const store: Store = {
    ...state,
    currentUser:
      state.users.find((u) => u.id === state.session) ?? state.users[0],
    nav,
    go,
    clock,
    notice,
    notifications: state.notifications.filter(
      (n) => n.userId === state.session,
    ),
    clearNotice: () => setNotice(""),
    supplierById: (id) => state.suppliers.find((s) => s.id === id),
    errandById: (id) => state.errands.find((e) => e.id === id),
    userById: (id) => state.users.find((u) => u.id === id),
    signIn: (email, password) => {
      const u = ref.current.users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password,
      )
      if (!u)
        return fail(
          "Email or password is incorrect. Try again or use a demo account.",
        )
      commit((d) => {
        d.session = u.id
      })
      go("browse")
      return true
    },
    signUp: (username, email, password) => {
      const error = accountError(username, email)
      if (error) return fail(error)
      if (
        password.length < 8 ||
        password.length > 64 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
      )
        return fail(
          "Use 8–64 characters with an uppercase letter, lowercase letter, and number.",
        )
      const id = nextId("u")
      commit((d) => {
        d.users.push({
          id,
          username: username.trim(),
          email: email.trim(),
          password,
          isAdmin: false,
          available: 100,
          reserved: 0,
        })
        d.txns.unshift({
          id: nextId("t"),
          userId: id,
          actorId: "system",
          type: "Initial allocation",
          amount: 100,
          time: timestamp(),
          note: "Welcome allocation",
        })
        d.session = id
      })
      go("suppliers")
      return true
    },
    requestPasswordReset: (email) => {
      const normalized = email.trim().toLowerCase()
      if (!/^\S+@\S+\.\S+$/.test(normalized)) { fail("Enter a valid email address."); return "" }
      // The same confirmation/demo-link surface is shown for unregistered addresses.
      for (const [token, link] of resetLinks.current) {
        if (link.email === normalized) resetLinks.current.delete(token)
      }
      const token = crypto.randomUUID()
      resetLinks.current.set(token, {
        email: normalized,
        userId: ref.current.users.find(user => user.email.toLowerCase() === normalized)?.id,
        expiresAt: Date.now() + 15 * 60 * 1000,
      })
      setNotice("")
      return token
    },
    isResetLinkValid: (token) => {
      const link = resetLinks.current.get(token)
      return !!link?.userId && link.expiresAt > Date.now()
    },
    resetPassword: (token, password, confirmation) => {
      const link = resetLinks.current.get(token)
      if (!link?.userId || link.expiresAt <= Date.now()) return fail("This reset link is invalid or expired. Request a new link.")
      if (password.length < 8 || password.length > 64 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return fail("Use 8–64 characters with an uppercase letter, lowercase letter, and number.")
      }
      if (password !== confirmation) return fail("The passwords do not match. Enter the same password in both fields.")
      commit(draft => {
        draft.users.find(user => user.id === link.userId)!.password = password
        draft.session = null
      })
      resetLinks.current.delete(token)
      setNotice("")
      return true
    },
    signOut: () => {
      commit((d) => {
        d.session = null
      })
      go("sign-in")
    },
    setRole: (role) => {
      commit((d) => {
        d.role = role
      })
      go(role === "courier" ? "browse" : "suppliers")
    },
    setAdmin: (id, value) => {
      if (!actor()?.isAdminManager)
        return fail(
          "Only an Admin Manager can change administrator privileges.",
        )
      if (!ref.current.users.some((u) => u.id === id))
        return fail("User not found.")
      commit((d) => {
        d.users.find((u) => u.id === id)!.isAdmin = value
      })
      return true
    },
    createErrand: ({ pickup, delivery, details, credits }) => {
      expire()
      const u = actor(),
        supplier = ref.current.suppliers.find(
          (s) => pickupName(s) === pickup && s.active !== false,
        )
      if (!u || !supplier || !delivery.trim() || !details.trim()) {
        fail("Choose an active supplier and complete the delivery details.")
        return ""
      }
      if (
        !Number.isSafeInteger(credits) ||
        credits < 1 ||
        credits > u.available
      ) {
        fail(
          "Enter a whole number of credits from 1 to your available balance.",
        )
        return ""
      }
      const id = nextId("e")
      commit((d) => {
        const e: Errand = {
          id,
          supplierId: supplier.id,
          pickup,
          delivery: delivery.trim(),
          details: details.trim(),
          credits,
          requesterId: u.id,
          courierId: null,
          status: "Open",
          createdAt: timestamp(),
          expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          activity: [],
          messages: [],
        }
        d.errands.unshift(e)
        const owner = d.users.find((p) => p.id === u.id)!
        owner.available -= credits
        owner.reserved += credits
        record(d, e, u.id, `created the request; ${credits} credits reserved`)
        transaction(
          d,
          e,
          u.id,
          u.id,
          "Reservation",
          -credits,
          "Moved from available to reserved",
        )
      })
      return id
    },
    acceptErrand: (id) => {
      expire()
      const u = actor(),
        e = ref.current.errands.find((e) => e.id === id)
      if (!u || !e || e.status !== "Open" || e.courierId)
        return fail("This request is no longer open. Choose another errand.")
      if (u.id === e.requesterId)
        return fail("You cannot accept your own request.")
      commit((d) => {
        const target = d.errands.find((e) => e.id === id)!
        target.courierId = u.id
        target.status = "Accepted"
        record(d, target, u.id, "accepted the request")
      })
      return true
    },
    advanceErrand: (id, to) => {
      const u = actor(),
        e = ref.current.errands.find((e) => e.id === id)
      if (!u || !e) return fail("Sign in to update this errand.")
      const valid =
        (e.status === "Accepted" &&
          to === "In Transit" &&
          u.id === e.courierId) ||
        (e.status === "In Transit" &&
          to === "Delivered" &&
          u.id === e.courierId) ||
        (e.status === "Delivered" &&
          to === "Completed" &&
          u.id === e.requesterId)
      if (!valid)
        return fail("This status change is not available to your account.")
      commit((d) => {
        const target = d.errands.find((e) => e.id === id)!
        target.status = to
        record(d, target, u.id, `marked as ${statusLabel(to).toLowerCase()}`)
        if (to === "Completed") {
          const requester = d.users.find((u) => u.id === e.requesterId)!,
            courier = d.users.find((u) => u.id === e.courierId)!
          requester.reserved -= e.credits
          courier.available += e.credits
          transaction(
            d,
            target,
            requester.id,
            u.id,
            "Transfer",
            -e.credits,
            `Paid from reserved credits to ${courier.username}`,
          )
          transaction(
            d,
            target,
            courier.id,
            u.id,
            "Receipt",
            e.credits,
            `Earned for delivery to ${requester.username}`,
          )
        }
      })
      return true
    },
    cancelErrand: (id) => {
      expire()
      const u = actor(),
        e = ref.current.errands.find((e) => e.id === id)
      if (!u || !e || e.requesterId !== u.id || e.status !== "Open")
        return fail("Only your open, unaccepted requests can be cancelled.")
      commit((d) =>
        release(d, d.errands.find((e) => e.id === id)!, "Cancelled", u.id),
      )
      return true
    },
    sendMessage: (id, text) => {
      const u = actor(),
        e = ref.current.errands.find((e) => e.id === id)
      if (
        !u ||
        !e ||
        !e.courierId ||
        ![e.requesterId, e.courierId].includes(u.id) ||
        !activeErrand(e) ||
        !text.trim()
      )
        return fail(
          "Messages are only available to participants on an active delivery.",
        )
      commit((d) => {
        d.errands
          .find((e) => e.id === id)!
          .messages.push({
            id: nextId("m"),
            senderId: u.id,
            text: text.trim(),
            time: timestamp(),
          })
      })
      return true
    },
    updateProfile: (username, email) => {
      const u = actor()
      if (!u) return fail("Sign in to edit your profile.")
      const error = accountError(username, email, u.id)
      if (error) return fail(error)
      commit((d) => {
        Object.assign(d.users.find((p) => p.id === u.id)!, {
          username: username.trim(),
          email: email.trim(),
        })
      })
      return true
    },
    saveSupplier: (data) => {
      const u = actor()
      if (!u?.isAdmin)
        return fail("Administrator privileges are required to edit suppliers.")
      if (
        ![data.name, data.location, data.description, data.hours].every((s) =>
          s?.trim(),
        )
      )
        return fail("Complete all supplier fields before saving.")
      commit((d) => {
        if (data.id) {
          const s = d.suppliers.find((s) => s.id === data.id)
          if (s)
            Object.assign(s, {
              name: data.name!.trim(),
              category: data.category,
              description: data.description!.trim(),
              hours: data.hours!.trim(),
              location: data.location!.trim(),
            })
        } else
          d.suppliers.push({
            id: nextId("s"),
            creatorId: u.id,
            active: true,
            name: data.name!.trim(),
            category: data.category ?? "Store",
            description: data.description!.trim(),
            hours: data.hours!.trim(),
            location: data.location!.trim(),
          })
      })
      return true
    },
    deleteSupplier: (id) => {
      expire()
      if (!actor()?.isAdmin)
        return fail(
          "Administrator privileges are required to deactivate suppliers.",
        )
      if (
        ref.current.errands.some((e) => e.supplierId === id && activeErrand(e))
      )
        return fail(
          "This supplier has active errands. Complete or close them before deactivating it.",
        )
      commit((d) => {
        const s = d.suppliers.find((s) => s.id === id)
        if (s) s.active = false
      })
      return true
    },
    markAllNotificationsRead: () =>
      commit((d) => {
        d.notifications
          .filter((n) => n.userId === d.session)
          .forEach((n) => {
            n.read = true
          })
      }),
  }
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
