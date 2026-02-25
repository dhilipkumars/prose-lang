import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Containers from './pages/Containers.jsx';
import Products from './pages/Products.jsx';

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <nav className="sidebar">
                    <div className="sidebar-logo">
                        Prose<span>DS</span>
                    </div>
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="icon">📊</span> Shipyard Dashboard
                    </NavLink>
                    <NavLink to="/containers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="icon">📦</span> Containers
                    </NavLink>
                    <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="icon">🏷️</span> Products
                    </NavLink>
                </nav>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/containers" element={<Containers />} />
                        <Route path="/products" element={<Products />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
