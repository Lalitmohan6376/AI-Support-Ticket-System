import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserTicketForm from './pages/UserTicketForm';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit-ticket" element={<UserTicketForm />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/support/dashboard" element={<StaffDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}