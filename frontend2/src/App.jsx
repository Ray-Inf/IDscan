import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';

export default function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <b>Home</b>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  <b>Register</b>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  <b>Login</b>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <br />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
