import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ user, isAdmin, cartCount, onLogout }) {
    return (
        <nav className="navbar glass">
            <span className="brand">📚 Book Library</span>

            {!isAdmin && (
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Browse
                    </NavLink>
                    <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </NavLink>
                    <NavLink to="/borrowed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        My Books
                    </NavLink>
                </div>
            )}

            <div className="nav-user">
                <span>{isAdmin ? '🔑 Librarian' : user?.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
