import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';

function isMobileView() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
