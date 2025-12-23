import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ApplyJob from './pages/ApplyJob';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
