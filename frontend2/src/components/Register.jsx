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
        <>
            {resultStatus !== "Done" ? (
                <>
                    <div className="form-group">
                        <label>Enter your name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="submit"
                            value="Take My Picture"
                            onClick={register}
                            className="btn btn-primary"
                        />
                    </div>
                </>
            ) : (
                <div>
                    <div className="details">
                        Hello {name}!
                        <br />
                        Your registration is successfully completed. Now you may proceed to login.
                    </div>
                </div>
            )}
        </>
    );
};

export default Register;
