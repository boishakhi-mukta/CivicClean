# CivicClean

**Live site:** https://your-netlify-site.netlify.app

CivicClean is a community cleanliness platform for reporting local issues, tracking clean-up progress, and supporting issue resolution through contributions.

## Key Features

- Report local cleanliness issues with title, category, description, image, and location details.
- Browse all reported issues and view detailed issue status information.
- Explore issue locations through an interactive map experience.
- Authenticate users with Firebase email/password and Google sign-in.
- Let logged-in users manage their own reported issues.
- Collect clean-up contributions and track funding progress for issues.
- Download PDF receipts for contribution records.
- Use responsive light and dark mode styling across the app.

## Tech Stack

- **Frontend:** React, React Router, Tailwind CSS
- **Authentication:** Firebase Authentication
- **HTTP Client:** Axios
- **Maps:** Leaflet, React Leaflet
- **PDF Receipts:** jsPDF, jsPDF AutoTable
- **UI Feedback:** React Hot Toast, SweetAlert2, React Awesome Reveal
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Deployment:** Netlify for the client, Vercel for the server

## Deployment Notes

The client is prepared for Netlify deployment with `netlify.toml` and `public/_redirects`, so route reloads resolve to `index.html`.

After deploying to Netlify, manually add your Netlify domain to Firebase:

1. Open Firebase Console.
2. Go to **Authentication**.
3. Open **Settings**.
4. Add your Netlify domain under **Authorized domains**.

Example domain:

```txt
your-netlify-site.netlify.app
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/CivicClean.git
cd CivicClean
```

### 2. Run the server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Update `server/.env` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicclean
PORT=5000
```

The server runs at:

```txt
http://localhost:5000
```

### 3. Run the client

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm start
```

Update `client/.env` with your Firebase project values:

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

The client runs at:

```txt
http://localhost:3000
```

## Production Environment Variables

For Netlify, add every variable from `client/.env.example` in the Netlify site environment settings. Set `REACT_APP_API_URL` to your deployed Vercel API URL, ending in `/api`.

For Vercel, add every variable from `server/.env.example` in the Vercel project environment settings.
