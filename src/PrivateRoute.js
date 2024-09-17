import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('auth') === 'true';

    // If the user is not authenticated, redirect to login
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
