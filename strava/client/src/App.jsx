import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StravaAuthResult from './pages/StravaAuthResult';

function Home() {
  const handleStravaLogin = () => {
    window.location.href = 'http://localhost:3001/auth/strava';
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h1>Вход через Strava</h1>
      <button
        onClick={handleStravaLogin}
        style={{ padding: '12px 24px', fontSize: 18, background: '#fc4c02', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 24 }}
      >
        Войти через Strava
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/strava-auth-result" element={<StravaAuthResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 