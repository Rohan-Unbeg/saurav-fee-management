import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import Students from './pages/Students';
import FeeCollection from './pages/FeeCollection';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Expenses from './pages/Expenses';
import axios from 'axios';
import API_URL from './config';

// Axios Interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure base URL is set if not already absolute (though we usually use full paths, setting base is good practice)
  if (!config.url?.startsWith('http')) {
    config.url = `${API_URL}${config.url}`;
  }
  return config;
});

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admission" element={<Admission />} />
              <Route path="/students" element={<Students />} />
              <Route path="/fee-collection" element={<FeeCollection />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/expenses" element={<Expenses />} /> {/* Added route for Expenses */}
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
