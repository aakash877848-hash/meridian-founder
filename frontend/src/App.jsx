import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FounderProfileForm from './pages/FounderProfileForm.jsx';
import FounderRequests from './pages/FounderRequests.jsx';
import VCSearch from './pages/VCSearch.jsx';
import StartupDetail from './pages/StartupDetail.jsx';
import VCShortlist from './pages/VCShortlist.jsx';
import VCPipeline from './pages/VCPipeline.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

          <Route
            path="/founder/profile"
            element={
              <ProtectedRoute roles={['founder']}>
                <PageTransition><FounderProfileForm /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/founder/requests"
            element={
              <ProtectedRoute roles={['founder']}>
                <PageTransition><FounderRequests /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vc/search"
            element={
              <ProtectedRoute roles={['investor', 'admin']}>
                <PageTransition><VCSearch /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vc/startups/:id"
            element={
              <ProtectedRoute roles={['investor', 'admin']}>
                <PageTransition><StartupDetail /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vc/shortlist"
            element={
              <ProtectedRoute roles={['investor', 'admin']}>
                <PageTransition><VCShortlist /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vc/pipeline"
            element={
              <ProtectedRoute roles={['investor', 'admin']}>
                <PageTransition><VCPipeline /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <PageTransition><AdminDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PageTransition><Home /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
