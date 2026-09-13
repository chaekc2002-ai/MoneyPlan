import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { Login, TutorialPopup } from './pages/Login';
import { Record } from './pages/Record';
import { Treehouse } from './pages/Treehouse';
import { Dashboard } from './pages/Dashboard';

function App() {
  const user = useAppStore(state => state.user);
  const setFirstLoginCompleted = useAppStore(state => state.setFirstLoginCompleted);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={!user ? <Login /> : <Navigate to="/record" />} />
          <Route path="/record" element={user ? <Record /> : <Navigate to="/" />} />
          <Route path="/treehouse" element={user ? <Treehouse /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        </Routes>
      </Router>
      {user?.isFirstLogin && (
        <TutorialPopup onClose={() => setFirstLoginCompleted()} />
      )}
    </>
  );
}

export default App;
