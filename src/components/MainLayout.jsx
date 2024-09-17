import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800">
                <div className="h-screen sticky top-0">
                    <Sidebar />
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white shadow-md">
                    <Header />
                </header>

                {/* Main content area with scroll */}
                <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
                    <div className="bg-white p-6 shadow-lg rounded-lg">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
