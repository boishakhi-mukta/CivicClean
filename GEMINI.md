# CivicClean: Community Cleanliness & Issue Reporting Portal

## 1. Project Context
**CivicClean** is a full-stack web application designed to empower communities to report, track, and resolve local cleanliness issues (e.g., illegal dumping, broken public bins, littering). The platform features an interactive issue map, a leaderboard to gamify community contributions, and status tracking for reported issues.

---

## 2. Tech Stack
- **Frontend**: React (Create React App), Tailwind CSS, React Router v6, Axios
- **Authentication**: Firebase Authentication (Email/Password + Google OAuth)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Deployment**: Client on Netlify, Server on Vercel
- **Data Fetching**: TanStack Query v5 (replaces all useEffect data fetching)
- **Charts**: recharts (for dashboard charts)
- **PDF Generation**: jsPDF + jsPDF-AutoTable (PDF invoice generation)

---

## 3. Page Architecture
- **Home (`/`)**: Landing page with call-to-actions, stats, and recent issues.
- **Dashboard (`/dashboard`)**: User dashboard showing their reported issues and contribution points.
- **Report Issue (`/report`)**: Form to submit a new issue (title, description, location, image).
- **Issue Map (`/map`)**: Interactive map displaying all open/in-progress issues.
- **Leaderboard (`/leaderboard`)**: Ranks users based on their contribution points.
- **Profile (`/profile`)**: User profile management and settings.
- **Login/Register (`/auth`)**: Authentication pages.
- **Citizen Dashboard (`/dashboard/citizen`)**: Citizen-specific dashboard (private).
  - `/dashboard/citizen/my-issues` — View issues reported by the citizen.
  - `/dashboard/citizen/report-issue` — Form to submit a new issue.
  - `/dashboard/citizen/profile` — Citizen profile management.
- **Staff Dashboard (`/dashboard/staff`)**: Staff-specific dashboard (private).
  - `/dashboard/staff/issues` — View and update issues assigned to this staff member.
  - `/dashboard/staff/profile` — Staff profile management.
- **Admin Dashboard (`/dashboard/admin`)**: Admin-specific dashboard (private).
  - `/dashboard/admin/issues` — View, assign, and manage all issues.
  - `/dashboard/admin/users` — View and manage all users.
  - `/dashboard/admin/staff` — View and manage staff accounts.
  - `/dashboard/admin/payments` — View all payment records.
  - `/dashboard/admin/profile` — Admin profile management.

---

## 4. API Routes (Backend)

### Authentication
- `POST /api/auth/verify`: Verify Firebase ID token and sync user with MongoDB.

### Issues
- `GET /api/issues`: List all issues. Supports query params: `?search=` `?priority=` `?status=` `?category=` `?page=` `?limit=`. Boosted issues always appear first (sorted by `isBoosted: -1`, then `createdAt: -1`).
- `POST /api/issues`: Create a new issue (requires auth).
- `GET /api/issues/:id`: Get detailed information about a specific issue.
- `PUT /api/issues/:id/status`: Update the status of an issue (e.g., Open -> In Progress -> Resolved).
- `POST /api/issues/:id/upvote`: Upvote an issue to increase its visibility.
- `PATCH /api/issues/:id/upvote`: Add upvote (auth required). Stores user email in `upvotes` array; users cannot upvote their own issues or upvote more than once.
- `PATCH /api/issues/:id/assign`: Assign a staff member to an issue (admin only).
- `PATCH /api/issues/:id/status`: Change issue status and append a timeline entry (staff only).
- `PATCH /api/issues/:id/reject`: Reject an issue and set `rejectedReason` (admin only).

### Users
- `POST /api/users`: Save a new user on first login.
- `GET /api/users/me`: Get the current user by email (auth required).
- `GET /api/users`: Get all users (admin only).
- `GET /api/users/staff`: Get all users with `role: 'staff'` (admin only).
- `GET /api/users/leaderboard`: Get the top contributors for the leaderboard.
- `GET /api/users/:id`: Get a user by MongoDB `_id`.
- `PATCH /api/users/:id/block`: Block or unblock a user (admin only).
- `PATCH /api/users/:id/role`: Update a user's role (admin only).
- `PATCH /api/users/:id`: Update user profile fields.
- `PATCH /api/users/increment-count`: Increment a user's `issueCount`.

### Payments
- `POST /api/payments`: Create a payment record (auth required).
- `GET /api/payments`: Get all payment records (admin only).
- `GET /api/payments/mine`: Get payment records for the currently authenticated user.

---

## 5. MongoDB Collections

### Issues Collection
```javascript
{
  title: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  image_url: String, // URL from cloud storage (e.g., Firebase Storage or Cloudinary)
  category: {
    type: String,
    enum: ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage']
  },
  priority: {
    type: String,
    enum: ['normal', 'high'],
    default: 'normal'
  },
  isBoosted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'working', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: [String], // array of user emails who upvoted
    default: []
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  assignedStaff: {
    staffId: mongoose.Schema.Types.ObjectId,
    staffName: String,
    staffEmail: String
    // default: null
  },
  timeline: [
    {
      message: String,
      updatedBy: String,
      role: String,
      status: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  rejectedReason: String,
  created_at: Date,
  updated_at: Date
}
```

### Users Collection
```javascript
{
  firebase_uid: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String,
  avatar_url: String,
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin'],
    default: 'citizen'
    // All existing users become 'citizen' by default (Mongoose handles this automatically)
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  issueCount: {
    type: Number,
    default: 0
  },
  total_points: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}
```

### Donations Collection
```javascript
{
  issueId: { type: String, required: true },
  issueTitle: String,
  amount: Number,
  name: String,
  email: String,
  phone: String,
  address: String,
  date: { type: Date, default: Date.now },
  additionalInfo: String
}
```

### Payments Collection
```javascript
{
  userEmail: String,
  amount: Number,
  type: {
    type: String,
    enum: ['boost', 'subscription']
  },
  issueId: String,       // optional
  issueTitle: String,    // optional
  transactionId: String,
  date: { type: Date, default: Date.now }
}
```

---

## 6. Middleware

- **`verifyToken`**: Validates the Firebase ID token sent in the `Authorization: Bearer <token>` header. Attaches the decoded user object to `req.user`. Returns `401` if the token is missing or invalid.
- **`verifyAdmin`**: Looks up the user from `req.user` in MongoDB and checks that `role === 'admin'`. Returns `403 Forbidden` if the role does not match.
- **`verifyStaff`**: Looks up the user from `req.user` in MongoDB and checks that `role === 'staff'` or `role === 'admin'`. Returns `403 Forbidden` if the role does not match.

---

## 7. Business Rules

- **Issue submission limit**: Free citizens (`isPremium: false`) can submit a maximum of **3 issues**. Premium citizens (`isPremium: true`) have unlimited submissions.
- **Boost sort order**: Boosted issues (`isBoosted: true`) always appear above normal issues in **all listings**. Default sort: `{ isBoosted: -1, createdAt: -1 }`.
- **Upvote restrictions**: Users cannot upvote their own issues. Each user can only upvote an issue once (their email is stored in the `upvotes` array and checked before allowing another vote).
- **Staff visibility**: Staff members can only see and update issues that have been assigned to them.
- **Timeline immutability**: Timeline entries are append-only. They are never edited or deleted.
- **Blocked users**: Blocked users (`isBlocked: true`) cannot submit, edit, upvote, or boost issues.

---

## 8. Environment Variables

### Client (`client/.env`)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_API_URL=http://localhost:5000/api  # Dev URL, change for prod
```

### Server (`server/.env`)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

---
*This document serves as the single source of truth for the CivicClean project setup and architecture.*
