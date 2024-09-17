import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    // Extracting the current page title dynamically from the route path
    const getPageTitle = (path) => {
        switch (path) {
            case '/dashboard':
                return 'Dashboard';
            case '/analytics':
                return 'Analytics';
            case '/settings':
                return 'Settings';
            case '/clickdataview':
                return 'Click Data View';
            default:
                return 'Page';
        }
    };

    const title = getPageTitle(location.pathname);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <div className="flex items-center space-x-4">
                {/* Profile Icon */}
                <img
                    src="https://via.placeholder.com/40"
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                />
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
