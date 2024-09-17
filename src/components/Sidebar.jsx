import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-gray-800 text-gray-100 flex flex-col sticky top-0 h-screen">
            <div className="text-2xl font-bold text-center py-6 border-b border-gray-700">
                Dashboard
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                <Link
                    to="/dashboard"
                    className={`block px-4 py-2 rounded ${isActive('/dashboard') ? 'bg-gray-700' : 'hover:bg-gray-700'} text-gray-100`}
                >
                    Home
                </Link>
                <Link
                    to="/analytics"
                    className={`block px-4 py-2 rounded ${isActive('/analytics') ? 'bg-gray-700' : 'hover:bg-gray-700'} text-gray-100`}
                >
                    Analytics
                </Link>
                <Link
                    to="/settings"
                    className={`block px-4 py-2 rounded ${isActive('/settings') ? 'bg-gray-700' : 'hover:bg-gray-700'} text-gray-100`}
                >
                    Settings
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
