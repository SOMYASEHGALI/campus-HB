import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ApplyJob from './pages/ApplyJob';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Login - No Navbar */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* All other routes with Navbar */}
        <Route path="/*" element={
          <div className="min-h-screen bg-bg-dark text-text-main">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/job/:id" element={
                <ProtectedRoute>
                  <ApplyJob />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
