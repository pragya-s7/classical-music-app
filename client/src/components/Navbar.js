import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ userId, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Piano<span>Library</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar; 