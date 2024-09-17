import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
// import MainLayout from './components/MainLayout';
import PrivateRoute from './PrivateRoute';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to={localStorage.getItem('auth') === 'true' ? '/dashboard' : '/login'} />}
                    />
                    <Route
                        path="/login"
                        element={localStorage.getItem('auth') === 'true' ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <PrivateRoute>
                                <Analytics />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Settings />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
