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

---

## 3. Page Architecture
- **Home (`/`)**: Landing page with call-to-actions, stats, and recent issues.
- **Dashboard (`/dashboard`)**: User dashboard showing their reported issues and contribution points.
- **Report Issue (`/report`)**: Form to submit a new issue (title, description, location, image).
- **Issue Map (`/map`)**: Interactive map displaying all open/in-progress issues.
- **Leaderboard (`/leaderboard`)**: Ranks users based on their contribution points.
- **Profile (`/profile`)**: User profile management and settings.
- **Login/Register (`/auth`)**: Authentication pages.

---

## 4. API Routes (Backend)

### Authentication
- `POST /api/auth/verify`: Verify Firebase ID token and sync user with MongoDB.

### Issues
- `GET /api/issues`: List all issues (supports filtering by status, sorting by date/upvotes).
- `POST /api/issues`: Create a new issue (requires auth).
- `GET /api/issues/:id`: Get detailed information about a specific issue.
- `PUT /api/issues/:id/status`: Update the status of an issue (e.g., Open -> In Progress -> Resolved).
- `POST /api/issues/:id/upvote`: Upvote an issue to increase its visibility.

### Users & Contributions
- `GET /api/users/:id/contributions`: Retrieve a user's contribution points and history.
- `GET /api/users/leaderboard`: Get the top contributors for the leaderboard.

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
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  created_at: Date,
  updated_at: Date
}
```

### Contributions Collection
```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  points: Number,
  action: {
    type: String,
    enum: ['Reported Issue', 'Resolved Issue', 'Upvoted Issue']
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  created_at: Date
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
    enum: ['User', 'Admin'],
    default: 'User'
  },
  total_points: {
    type: Number,
    default: 0
  },
  created_at: Date
}
```

---

## 6. Environment Variables

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
