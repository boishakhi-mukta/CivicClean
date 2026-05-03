# CivicClean

**CivicClean** is a full-stack community cleanliness platform that helps people report local issues, view issue locations, track clean-up progress, and support resolutions through contributions.

**Live site:** https://your-netlify-site.netlify.app  
**Backend API:** https://civic-clean-olive.vercel.app

## Features

- Report local cleanliness issues with title, category, description, image, and location details.
- Browse all reported issues and open detailed issue pages.
- View issues on an interactive map powered by Leaflet.
- Register and log in with Firebase Authentication.
- Manage personal issue reports from a protected user area.
- Contribute funding toward clean-up work and track funding progress.
- Download PDF receipts for contribution records.
- Use a responsive interface with light and dark mode support.

## Tech Stack

### Client

- React
- React Router
- Tailwind CSS
- Axios
- Firebase Authentication
- Leaflet and React Leaflet
- jsPDF and jsPDF AutoTable
- React Hot Toast and SweetAlert2

### Server

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- CORS

### Deployment

- Client: Netlify
- Server: Vercel
- Database: MongoDB Atlas

## Project Structure

```txt
CivicClean/
├── client/          # React frontend
├── server/          # Express backend API
├── GEMINI.md        # Project notes and architecture context
└── README.md        # GitHub project documentation
```

## Environment Variables

### Client

Create `client/.env` from `client/.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

For production, set:

```env
REACT_APP_API_URL=https://civic-clean-olive.vercel.app/api
```

### Server

Create `server/.env` from `server/.env.example`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicclean
PORT=5000
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Boishakhi11/CivicClean.git
cd CivicClean
```

### 2. Start the server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The server runs at:

```txt
http://localhost:5000
```

### 3. Start the client

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm start
```

The client runs at:

```txt
http://localhost:3000
```

## Deployment

### Client on Netlify

Use these Netlify settings:

```txt
Base directory: client
Build command: npm run build
Publish directory: build
```

The client includes:

- `client/netlify.toml`
- `client/public/_redirects`

These files make React Router route reloads work correctly on Netlify.

After deploying, add your Netlify domain to Firebase:

```txt
Firebase Console -> Authentication -> Settings -> Authorized domains
```

### Server on Vercel

Use these Vercel settings:

```txt
Root directory: server
```

Add the server environment variables in Vercel:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
```

The server includes `server/vercel.json`, which routes requests to `index.js`.

## API Overview

- `GET /api/issues` - list issues
- `POST /api/issues` - create an issue
- `GET /api/issues/:id` - get one issue
- `PUT /api/issues/:id` - update an issue
- `DELETE /api/issues/:id` - delete an issue
- `GET /api/donations` - list donations
- `POST /api/donations` - create a donation
- `POST /api/auth/verify` - sync Firebase user with MongoDB
- `GET /api/users/leaderboard` - get leaderboard users
- `GET /api/stats` - get platform stats

## Notes

- Do not commit real `.env` files.
- Use MongoDB Atlas for deployed database access.
- Redeploy Netlify after changing frontend environment variables.
- Firebase authorized domains must include the final Netlify domain for login to work in production.
