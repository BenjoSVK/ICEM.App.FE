import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './layout/Navbar';
import Home from '../pages/Home';
import ImageUpload from '../pages/ImageUpload';
import TiffList from '../pages/TiffList';
import GeoJSONList from '../pages/GeoJSONList';
import Login from './auth/Login';
import { AuthService } from '../application/Application/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize state from localStorage during first render
    // Start with false - will be validated on mount
    return false;
  });

  const [isValidating, setIsValidating] = useState(true);

  const [lastActivity, setLastActivity] = useState(() => {
    // Initialize lastActivity from localStorage or current time
    const storedLastActivity = localStorage.getItem('lastActivity');
    return storedLastActivity ? parseInt(storedLastActivity) : Date.now();
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
  }, []);

  // Validate token on mount if it exists in localStorage
  useEffect(() => {
    const validateAuth = async () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedToken = localStorage.getItem('access_token');
      const storedLastActivity = localStorage.getItem('lastActivity');
      
      // If no token or auth flag, user is not authenticated
      if (!storedToken || storedAuth !== 'true') {
        setIsValidating(false);
        setIsAuthenticated(false);
        return;
      }

      // Check timeout first
      if (storedLastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(storedLastActivity);
        if (timeSinceLastActivity >= TIMEOUT_DURATION) {
          handleLogout();
          setIsValidating(false);
          return;
        }
      }

      // Validate token with backend
      try {
        const isValid = await AuthService.validateToken();
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, logout
          handleLogout();
        }
      } catch (error) {
        // Network error or invalid token
        handleLogout();
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [handleLogout]);

  useEffect(() => {
    // Set up activity listeners
    const updateActivity = () => {
      const currentTime = Date.now();
      setLastActivity(currentTime);
      localStorage.setItem('lastActivity', currentTime.toString());
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Check for inactivity
    const inactivityCheck = setInterval(() => {
      const currentTime = Date.now();
      const storedLastActivity = localStorage.getItem('lastActivity');
      
      if (storedLastActivity && isAuthenticated) {
        const timeSinceLastActivity = currentTime - parseInt(storedLastActivity);
        if (timeSinceLastActivity >= TIMEOUT_DURATION) {
          handleLogout();
        }
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [isAuthenticated, handleLogout]);

  // Update localStorage when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
    }
  }, [isAuthenticated]);

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login onLogin={setIsAuthenticated} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-upload"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ImageUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tiff-list"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TiffList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/geojson-list"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <GeoJSONList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;