import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        // Dummy login authentication
        if (username === 'jeffery' && password === 'Mrlonley#123') {
            localStorage.setItem('auth', 'true');
            navigate('/dashboard');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex justify-center items-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>
                {/* <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <a href="/#" className="text-blue-500 hover:underline">
                        Sign Up
                    </a>
                </p> */}
            </div>
        </div>
    );
};

export default Login;
