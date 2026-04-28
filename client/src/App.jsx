import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import AllIssuesPage from './pages/AllIssuesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IssueDetailPage from './pages/IssueDetailPage';
import AddIssuePage from './pages/AddIssuePage';
import MyIssuesPage from './pages/MyIssuesPage';
import MyContributionPage from './pages/MyContributionPage';
import NotFoundPage from './pages/NotFoundPage';

// Routes
import PrivateRoute from './routes/PrivateRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/issues" element={<AllIssuesPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private Routes */}
        <Route 
          path="/add-issue" 
          element={
            <PrivateRoute>
              <AddIssuePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/my-issues" 
          element={
            <PrivateRoute>
              <MyIssuesPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/my-contributions" 
          element={
            <PrivateRoute>
              <MyContributionPage />
            </PrivateRoute>
          } 
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
