import React, { useState } from 'react';

const Login = () => {
    const [name, setName] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const login = () => {
        fetch("http://127.0.0.1:5000/login")
            .then((res) => res.text())
            .then((res) => {
                setName(res);
                setLoggedIn(true);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg">
                {!loggedIn ? (
                    <div className="text-center">
                        <button
                            onClick={login}
                            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Authenticate Me
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                            Hello {name}!
                        </h2>
                        <p className="text-gray-700 mb-4">
                            You are successfully logged in to the system. You may logout of the system by clicking the
                            button below.
                        </p>
                        <button
                            onClick={() => {
                                setName(null);
                                setLoggedIn(false);
                            }}
                            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
