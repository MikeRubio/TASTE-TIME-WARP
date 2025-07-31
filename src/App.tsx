import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import WarpConsole from './components/WarpConsole';
import EraReport from './components/EraReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/console" element={<WarpConsole />} />
        <Route path="/w/:id" element={<EraReport />} />
      </Routes>
    </Router>
  );
}

export default App;