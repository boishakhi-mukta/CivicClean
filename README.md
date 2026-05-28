# CivicClean

**CivicClean** is a full-stack civic issue reporting and management platform that empowers citizens to report local problems, track resolutions, and support clean-up efforts through community contributions.

**Live site:** https://civic-clean-oslo.netlify.app/
**Backend API:** https://civic-clean-olive.vercel.app

---

## Test Credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@civicclean.com       | Admin@123   |
| Staff   | staff@civicclean.com       | Staff@123   |
| Citizen | citizen@civicclean.com     | Citizen@123 |

> Create the citizen account via the `/register` page (or Sign in with Google). The admin and staff accounts are pre-seeded.

---

## Features

- **Role-based dashboards** for Citizens, Staff, and Admins — each with a dedicated sidebar layout and protected routes that redirect on unauthorized access.
- **Issue reporting** — Citizens submit civic issues (garbage, road damage, illegal construction, broken public property) with title, category, location, description, and an optional image URL.
- **Staff workflow** — Staff advance issue status in one direction only: pending → in-progress → working → resolved → closed, with a confirmation modal at each step.
- **Admin controls** — Admins assign staff to issues, reject issues with a reason, block/unblock citizen accounts, and view all platform payments with PDF invoice download.
- **Upvoting and Priority Boost** — Citizens can upvote issues they care about (own-issue guard enforced); issue owners can pay ৳100 to boost their issue to High Priority via a payment modal.
- **Premium subscription** — Citizens can pay ৳1,000 for unlimited issue reporting; free accounts are capped at 3 submissions.
- **Issue timeline** — Every status change, staff assignment, and admin action is recorded in a chronological timeline displayed on the issue detail page.
- **Contribution funding** — Any logged-in user can contribute NOK amounts toward an issue's clean-up budget; a live progress bar tracks funding vs. the suggested budget.
- **Interactive issue map** — All reported issues are plotted on a Leaflet map with popups linking to the detail page.
- **Community leaderboard** — Top contributors ranked by earned points, with PDF receipt download for payment history and contribution records.

---

## Tech Stack

### Client

- React + React Router v6
- Tailwind CSS
- TanStack Query v5 (all data fetching)
- Firebase Authentication + Firebase Storage
- Recharts (dashboard charts)
- Leaflet / React Leaflet (issue map)
- jsPDF + jsPDF AutoTable (PDF generation)
- React Hook Form + SweetAlert2 + React Hot Toast

### Server

- Node.js + Express
- MongoDB + Mongoose
- Firebase Admin SDK (JWT verification)
- dotenv / CORS

### Deployment

- Client: Netlify
- Server: Vercel
- Database: MongoDB Atlas

---

## Project Structure

```
CivicClean/
├── client/          # React frontend
│   └── src/
│       ├── api/           # axiosInstance
│       ├── components/    # Shared UI (Navbar, IssueCard, PhotoUploader, IssueTimeline…)
│       ├── context/       # AuthContext, ThemeContext
│       ├── pages/
│       │   └── dashboard/
│       │       ├── admin/   # AdminDashboardLayout + 6 sub-pages
│       │       ├── staff/   # StaffDashboardLayout + 3 sub-pages
│       │       └── citizen/ # CitizenDashboardLayout + 4 sub-pages
│       └── routes/        # PrivateRoute, AdminRoute, StaffRoute
└── server/          # Express API
    ├── middlewares/   # verifyToken, verifyAdmin, verifyStaff
    ├── models/        # Issue, User, Payment, Donation, Contribution
    └── routes/        # authRoutes, issueRoutes, userRoutes, paymentRoutes, donationRoutes
```

---

## Environment Variables

### Client (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

For production set `REACT_APP_API_URL=https://civic-clean-olive.vercel.app/api`.

### Server (`server/.env`)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicclean
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## Run Locally

```bash
# 1. Clone
git clone https://github.com/Boishakhi11/CivicClean.git
cd CivicClean

# 2. Server
cd server && npm install && cp .env.example .env
npm run dev   # http://localhost:5000

# 3. Client (new terminal)
cd client && npm install && cp .env.example .env
npm start     # http://localhost:3000
```

---

## Deployment

### Netlify (client)

```
Base directory:    client
Build command:     npm run build
Publish directory: build
```

Add your Netlify domain to Firebase → Authentication → Authorized domains.

### Vercel (server)

```
Root directory: server
```

Set `MONGODB_URI` and `FIREBASE_SERVICE_ACCOUNT` as Vercel environment variables.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List issues (pagination, search, filters) |
| POST | `/api/issues` | Create issue (auth required) |
| GET | `/api/issues/:id` | Get single issue |
| PUT | `/api/issues/:id` | Edit issue (owner only) |
| DELETE | `/api/issues/:id` | Delete issue (owner only) |
| PATCH | `/api/issues/:id/upvote` | Upvote issue (auth, own-issue guard) |
| PATCH | `/api/issues/:id/assign` | Assign staff (admin only) |
| PATCH | `/api/issues/:id/status` | Advance status (staff only) |
| PATCH | `/api/issues/:id/reject` | Reject issue (admin only) |
| GET | `/api/users` | List citizens (admin only) |
| GET | `/api/users/staff` | List staff (admin only) |
| GET | `/api/users/leaderboard` | Top contributors by points |
| PATCH | `/api/users/:id/block` | Block/unblock user (admin only) |
| GET | `/api/payments` | List payments (admin only) |
| POST | `/api/payments` | Create payment (boost / subscription) |
| GET | `/api/donations` | List donations by issue or user |
| POST | `/api/donations` | Create donation |
| POST | `/api/auth/verify` | Sync Firebase user with MongoDB |
| GET | `/api/stats` | Platform-wide stats |
