import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/founder/profile"
          element={
            <ProtectedRoute roles={['founder']}>
              <FounderProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/founder/requests"
          element={
            <ProtectedRoute roles={['founder']}>
              <FounderRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vc/search"
          element={
            <ProtectedRoute roles={['investor', 'admin']}>
              <VCSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vc/startups/:id"
          element={
            <ProtectedRoute roles={['investor', 'admin']}>
              <StartupDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vc/shortlist"
          element={
            <ProtectedRoute roles={['investor', 'admin']}>
              <VCShortlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vc/pipeline"
          element={
            <ProtectedRoute roles={['investor', 'admin']}>
              <VCPipeline />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
