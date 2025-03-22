
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div>
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
    <Link to="/dashboard">
      <button>Back to Dashboard</button>
    </Link>
  </div>
);

export default Unauthorized;