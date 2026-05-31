# CivicClean

CivicClean is a full-stack civic issue reporting and management platform. Citizens report local problems, staff resolve them, and admins oversee the entire workflow — all through role-based dashboards.

**Live site:** https://civic-clean-oslo.netlify.app/  
**Backend API:** https://civic-clean-olive.vercel.app

---

## Test Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@civicclean.com   | Admin@123   |
| Staff   | staff@civicclean.com   | Staff@123   |
| Citizen | citizen@civicclean.com | Citizen@123 |

> Citizen accounts can also be created via `/register` or Google Sign-In. Admin and staff accounts are pre-seeded.

---

## Features

### Citizen
- **Report issues** — Submit civic problems (Garbage, Road Damage, Illegal Construction, Broken Public Property) with title, category, priority (Low / Medium / High), location, description, and an optional photo.
- **Free account limit** — Free accounts are capped at 3 issue submissions. Upgrade to Premium (kr 1,000) for unlimited reporting.
- **My Issues dashboard** — View, edit (pending-only), and delete your own issues in a filterable table. Priority badges use colour-coded labels (red / orange / green).
- **Boost an issue** — Pay kr 99 to pin your issue to the top of the All Issues page and upgrade its priority to High. A payment modal lets you choose the payment method.
- **Upvote** — Upvote any issue you didn't report to signal community importance. Each user can upvote an issue once; the count is updated instantly without a page reload.
- **Issue detail page** — View the full description, photo, timeline of every status change, upvote count, and a community funding progress bar.
- **Contribution funding** — Contribute any NOK amount toward an issue's suggested clean-up budget. A live progress bar shows funding vs. target.

### Staff
- **Assigned Issues dashboard** — See only the issues assigned to you, filterable by status and priority.
- **Advance status** — Move issues through the workflow: `pending → in-progress → working → resolved`, with a note on each transition.

### Admin
- **All Issues** — Browse every issue with search, category, status, and priority filters. Assign issues to staff or reject them with a reason.
- **Manage Users** — View all citizens; block or unblock accounts.
- **Manage Staff** — View staff members; block or unblock staff accounts.
- **Payments** — View all boost and subscription payments in a table; download individual PDF invoices.
- **Overview dashboard** — Stat cards (total issues, resolved, pending, rejected, total revenue), revenue-by-month bar chart, issues-by-status pie chart, and mini tables for latest issues, payments, and users.

### Public
- **All Issues page** — Paginated grid (6 per page) of all reported issues. Boosted issues always appear first. Filter by search text, category, or status. Each card shows the issue image, title, location, category tag, status badge, priority badge, and upvote count.
- **Interactive map** — All issues plotted on a Leaflet map with popups linking to the detail page.
- **Leaderboard** — Top contributors ranked by points earned from donations.

---

## Issue Workflow

```
pending  →  in-progress  →  working  →  resolved
                                    ↘
                              rejected  (admin only, at any stage)
```

---

## Tech Stack

### Client
| Library | Purpose |
|---------|---------|
| React 18 + React Router v6 | UI and routing |
| Tailwind CSS | Styling |
| TanStack Query v5 | Data fetching, caching, and mutations |
| Firebase Auth + Firebase Storage | Authentication and photo uploads |
| Recharts | Bar chart and pie chart on admin overview |
| Leaflet / React Leaflet | Interactive issue map |
| React Hook Form | Form handling and validation |
| jsPDF + jsPDF-AutoTable | PDF invoice generation |
| SweetAlert2 + React Hot Toast | Modals and notifications |

### Server
| Library | Purpose |
|---------|---------|
| Node.js + Express | REST API |
| MongoDB + Mongoose | Database and schemas |
| Firebase Admin SDK | Firebase JWT verification |
| dotenv + CORS | Config and cross-origin requests |

### Deployment
| Part | Platform |
|------|----------|
| Client | Netlify |
| Server | Vercel |
| Database | MongoDB Atlas |

---

## Project Structure

```
CivicClean/
├── client/
│   └── src/
│       ├── api/              # axiosInstance
│       ├── components/       # Navbar, IssueCard, IssueTimeline, PhotoUploader…
│       ├── context/          # AuthContext, ThemeContext
│       ├── pages/
│       │   ├── AllIssuesPage.jsx
│       │   ├── IssueDetailPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── MapPage.jsx
│       │   ├── LeaderboardPage.jsx
│       │   └── dashboard/
│       │       ├── admin/    # AdminDashboardLayout, Overview, AllIssues, ManageUsers, ManageStaff, Payments, Profile
│       │       ├── staff/    # StaffDashboardLayout, AssignedIssues, Profile
│       │       └── citizen/  # CitizenDashboardLayout, ReportIssue, MyIssues, Profile, Contributions
│       └── routes/           # PrivateRoute, AdminRoute, StaffRoute
└── server/
    ├── middlewares/          # verifyToken, verifyAdmin, verifyStaff
    ├── models/               # Issue, User, Payment, Donation, Contribution
    ├── routes/               # authRoutes, issueRoutes, userRoutes, paymentRoutes, donationRoutes
    └── index.js
```

---

## Environment Variables

### Client — `client/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

Set `REACT_APP_API_URL=https://civic-clean-olive.vercel.app/api` for production.

### Server — `server/.env`

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/civicclean
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Boishakhi11/CivicClean.git
cd CivicClean

# 2. Start the server
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:5000

# 3. Start the client (new terminal)
cd client
npm install
cp .env.example .env   # fill in your values
npm start              # http://localhost:3000
```

---

## Deployment

### Netlify (client)

```
Base directory:    client
Build command:     npm run build
Publish directory: client/build
```

Add your Netlify domain to **Firebase → Authentication → Authorized domains**.

### Vercel (server)

```
Root directory: server
```

Set `MONGODB_URI` and `FIREBASE_SERVICE_ACCOUNT` as Vercel environment variables.

---

## API Reference

### Issues

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/issues` | — | List issues — supports `?page`, `?limit`, `?search`, `?category`, `?status`, `?priority`, `?email`. Boosted issues always sort first. |
| POST | `/api/issues` | Citizen | Create issue |
| GET | `/api/issues/:id` | — | Get single issue |
| PUT | `/api/issues/:id` | Owner | Edit issue |
| DELETE | `/api/issues/:id` | Owner | Delete issue |
| PATCH | `/api/issues/:id/upvote` | Auth | Upvote (own-issue blocked, once per user) |
| PATCH | `/api/issues/:id/assign` | Admin | Assign staff |
| PATCH | `/api/issues/:id/status` | Staff | Advance status |
| PATCH | `/api/issues/:id/reject` | Admin | Reject with reason |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List citizens |
| GET | `/api/users/staff` | Admin | List staff |
| GET | `/api/users/leaderboard` | — | Top contributors |
| PATCH | `/api/users/:id/block` | Admin | Block / unblock user |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payments` | Admin | All payments |
| GET | `/api/payments/mine` | Auth | Current user's payments |
| POST | `/api/payments` | Auth | Create payment (`type: boost \| subscription`) |

### Donations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/donations` | — | List donations (filter by `?issueId` or `?email`) |
| POST | `/api/donations` | Auth | Create donation |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/verify` | Firebase token | Sync Firebase user → MongoDB, return role |
