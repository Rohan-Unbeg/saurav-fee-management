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
import NotFound from './pages/NotFound';
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

// Axios Response Interceptor for Global Error Handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network Errors
    if (!error.response) {
      toast.error('Network Error: Please check your internet connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized (Session Expired)
    if (status === 401) {
      // Only redirect if not already on login page to avoid loops
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      toast.error('Access Denied: You do not have permission to perform this action.');
    }

    // Handle 500 Server Errors
    if (status === 500) {
      toast.error('Server Error: Something went wrong on our end. Please try again later.');
    }

    // Handle 404 Not Found (Global)
    if (status === 404 && typeof data === 'string' && data.includes('Cannot')) {
       // Only generic 404s, specific API 404s might be handled by components
       // toast.error('Resource not found.');
    }

    return Promise.reject(error);
  }
);

import { Toaster, toast } from 'sonner';

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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
