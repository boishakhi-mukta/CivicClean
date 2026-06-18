# CivicClean 🌿
Empowering communities to report, track, and resolve local civic issues — one neighbourhood at a time.

## Table of Contents 📖
- [About the Project](#about-the-project)
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project 📃

CivicClean is a full-stack civic issue reporting and management platform that bridges the gap between citizens and local authorities. It empowers individuals to report real-world problems — from potholes to illegal dumping — and enables staff and admins to triage, assign, and resolve them efficiently through role-based dashboards.

Built with a focus on transparency and community engagement, CivicClean brings live issue maps, community funding, upvoting, and real-time status tracking into one cohesive platform. Whether you're a citizen frustrated by a crumbling road, a staff member managing your assigned tasks, or an admin overseeing an entire city's operations, CivicClean makes civic engagement simple, visible, and impactful.

**Live Site:** https://civic-clean-oslo.netlify.app/
**Backend API:** https://civic-clean-olive.vercel.app

---

## Project Overview 📊

| Item | Detail |
|---|---|
| **Objective** | Build a civic issue reporting platform connecting citizens with local authorities through transparent, role-based workflows |
| **Target Audience** | Citizens, municipal staff, city administrators |
| **Issue Categories** | Garbage, Road Damage, Illegal Construction, Broken Public Property |
| **Issue Workflow** | `pending → in-progress → working → resolved` (or `rejected`) |
| **Deployment** | Netlify (client) + Vercel (server) + MongoDB Atlas |

### Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@civicclean.com | Admin@123 |
| Staff | staff@civicclean.com | Staff@123 |
| Citizen | Register at `/register` or use Google Sign-In | — |

---

## ✨ Key Features

### 1. Civic Issue Reporting
- Submit issues with title, category, priority (Low / Medium / High), location, description, and an optional photo.
- Free accounts are capped at **3 submissions** — upgrade to **Premium (kr 1,000)** for unlimited reporting.
- Edit or delete your own pending issues from a filterable dashboard.

### 2. Community Engagement
- **Upvote** any issue you didn't submit to signal its importance to the community (once per user, instant update).
- **Boost an Issue** — Pay kr 99 to pin your issue to the top of the All Issues page and escalate its priority to High.
- **Contribution Funding** — Donate any NOK amount toward an issue's clean-up budget; a live progress bar tracks funding vs. target.

### 3. Citizen Dashboard
- View and manage all your submitted issues in one place.
- Track payment history (boosts and subscriptions).
- Monitor your contribution activity and leaderboard points.

### 4. Staff Dashboard
- View only the issues assigned to you, filterable by status and priority.
- Advance issue status through the workflow (`pending → in-progress → working → resolved`) with a note on each transition.

### 5. Admin Dashboard
- Browse every reported issue with search, category, status, and priority filters.
- Assign issues to staff members or reject them with a reason.
- Manage citizen and staff accounts (view, block, unblock).
- View all boost and subscription payments; download individual **PDF invoices**.

### 6. Analytics & Insights
- Stat cards: total issues, resolved, pending, rejected, total revenue.
- Revenue-by-month bar chart and issues-by-status pie chart powered by Recharts.
- Mini tables for latest issues, payments, and recently active users.

### 7. Interactive Map
- All reported issues plotted on a Leaflet map with popups linking to the full detail page.
- Visual overview of civic activity across the entire city.

### 8. Leaderboard
- Top contributors ranked by points earned from community donations.
- Encourages ongoing civic participation and recognition.

### 9. Additional Features
- **Fully Responsive** — Accessible on desktop, tablet, and mobile.
- **Role-based Access Control** — Private routes enforce citizen, staff, and admin permissions.
- **Firebase Auth** — Email/password and Google Sign-In with JWT token verification.
- **Scalable Infrastructure** — Hosted on Netlify and Vercel with MongoDB Atlas.

---

## Tech Stack 🛠️

### Frontend
| Library | Purpose |
|---|---|
| React 19 + React Router v7 | UI and client-side routing |
| Tailwind CSS | Utility-first styling |
| TanStack Query v5 | Data fetching, caching, and mutations |
| Firebase Auth + Firebase Storage | Authentication and photo uploads |
| Recharts | Bar chart and pie chart on admin overview |
| Leaflet / React Leaflet | Interactive issue map |
| React Hook Form | Form handling and validation |
| jsPDF + jsPDF-AutoTable | PDF invoice generation |
| SweetAlert2 + React Hot Toast | Modals and notifications |
| Axios | HTTP client |

### Backend
| Library | Purpose |
|---|---|
| Node.js + Express 5 | REST API |
| MongoDB + Mongoose | Database and schemas |
| Firebase Admin SDK | Firebase JWT verification |
| Nodemailer | Email notifications |
| dotenv + CORS | Config and cross-origin requests |

### Deployment
| Part | Platform |
|---|---|
| Client | Netlify |
| Server | Vercel |
| Database | MongoDB Atlas |

---

## Installation ⚙️

Clone the repo and install dependencies:

```bash
git clone https://github.com/boishakhi-mukta/CivicClean.git
cd CivicClean
```

### Server Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/civicclean
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

```bash
npm run dev   # http://localhost:5000
```

### Client Setup (new terminal)

```bash
cd client
npm install
```

Create `client/.env`:

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

```bash
npm start     # http://localhost:3000
```

---

## API Reference 📡

### Issues

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/issues` | — | List issues — supports `?page`, `?limit`, `?search`, `?category`, `?status`, `?priority`, `?email`. Boosted issues sort first. |
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
|---|---|---|---|
| GET | `/api/users` | Admin | List citizens |
| GET | `/api/users/staff` | Admin | List staff |
| GET | `/api/users/leaderboard` | — | Top contributors |
| PATCH | `/api/users/:id/block` | Admin | Block / unblock user |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/payments` | Admin | All payments |
| GET | `/api/payments/mine` | Auth | Current user's payments |
| POST | `/api/payments` | Auth | Create payment (`type: boost \| subscription`) |

### Donations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/donations` | — | List donations (filter by `?issueId` or `?email`) |
| POST | `/api/donations` | Auth | Create donation |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/verify` | Firebase token | Sync Firebase user → MongoDB, return role |

---

## Contributing 🤝

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Steps to contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact 📬

**Boishakhi Mukta**

- LinkedIn: [linkedin.com/in/boishakhimukta](https://www.linkedin.com/in/boishakhimukta/)
- GitHub: [github.com/boishakhi-mukta](https://github.com/boishakhi-mukta)
- Email: bgmukta11@gmail.com

**Live URL:** https://civic-clean-oslo.netlify.app/
**Project Repository:** https://github.com/boishakhi-mukta/CivicClean
