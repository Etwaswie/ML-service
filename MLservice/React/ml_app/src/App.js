import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import RegistrationPage from './components/RegistrationPage';
import UserDashboard from './components/UserDashboard';
import ModelPage from './components/ModelPage'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/models/:id" element={<ModelPage />} />
      </Routes>
    </Router>
  );
};

export default App;
