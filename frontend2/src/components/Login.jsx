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
        <>
            {!loggedIn ? (
                <>
                    <div className="form-group">
                        <input
                            type="submit"
                            value="Authenticate Me"
                            onClick={login}
                            className="btn btn-primary"
                        />
                    </div>
                </>
            ) : (
                <div>
                    <div className="details">
                        Hello {name}!
                        <br />
                        You are successfully logged in to the system.
                        You may logout of the system by clicking on the logout button as shown below.
                        <div className="form-group">
                            <input
                                type="submit"
                                value="Logout"
                                onClick={() => {
                                    setName(null);
                                    setLoggedIn(false);
                                }}
                                className="btn btn-primary"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
