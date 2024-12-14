import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <section className="mb-8">
                    <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Introduction of the web-app</h3>
                    <p className="text-gray-700">
                        This web application is made for the purpose of face recognition login using ReactJS as a frontend
                        and Python Flask as a backend. Hence, make sure that you have ReactJS as well as Python Flask
                        configured on your machine in order to run this application.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Registration Process</h3>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>First of all, navigate to the register section from the navbar of this page.</li>
                        <li>Start your Python Flask server.</li>
                        <li>
                            Enter your name and click on the button which will take your image for the registration
                            purpose, helping you log in to the system.
                        </li>
                        <li>Registration is completed successfully.</li>
                    </ol>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Login Process</h3>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>First of all, navigate to the login section from the navbar of this page.</li>
                        <li>Make sure that the Python server is started.</li>
                        <li>
                            Click on the login button which will take your image for the login purpose and will allow you to
                            enter the system if you are an authenticated user.
                        </li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default Home;
