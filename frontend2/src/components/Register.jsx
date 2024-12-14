import React, { useState } from 'react';

const Register = () => {
    const [name, setName] = useState(null);
    const [resultStatus, setResultStatus] = useState(null);

    const register = () => {
        fetch(`http://127.0.0.1:5000/register?name=${name}`)
            .then((res) => res.text())
            .then((res) => {
                setResultStatus(res);
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
                {resultStatus !== "Done" ? (
                    <div>
                        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
                            Register Your Account
                        </h2>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                                Enter Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="text-center">
                            <button
                                onClick={register}
                                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Take My Picture
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                            Hello {name}!
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Your registration was successfully completed. You can now proceed to login.
                        </p>
                        <div>
                            <button
                                onClick={() => setResultStatus(null)}
                                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Back to Register
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
