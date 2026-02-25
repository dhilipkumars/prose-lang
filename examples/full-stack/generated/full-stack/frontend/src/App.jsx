import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BrowsePage from './pages/BrowsePage';
import CartPage from './pages/CartPage';
import BorrowedPage from './pages/BorrowedPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';

export default function App() {
    const [user, setUser] = useState(null);         // { member_id, name }
    const [isAdmin, setIsAdmin] = useState(false);
    const [cart, setCart] = useState([]);

    const addToCart = (book) => {
        if (!cart.find((b) => b.book_id === book.book_id)) {
            setCart([...cart, book]);
        }
    };

    const removeFromCart = (bookId) => {
        setCart(cart.filter((b) => b.book_id !== bookId));
    };

    const clearCart = () => setCart([]);

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        setCart([]);
    };

    if (!user && !isAdmin) {
        return <AuthPage onLogin={setUser} onAdminLogin={() => setIsAdmin(true)} />;
    }

    return (
        <BrowserRouter>
            <Navbar user={user} isAdmin={isAdmin} cartCount={cart.length} onLogout={logout} />
            <div className="app-container">
                <Routes>
                    {isAdmin ? (
                        <>
                            <Route path="/" element={<AdminPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route
                                path="/"
                                element={<BrowsePage user={user} cart={cart} onAddToCart={addToCart} />}
                            />
                            <Route
                                path="/cart"
                                element={
                                    <CartPage
                                        user={user}
                                        cart={cart}
                                        onRemove={removeFromCart}
                                        onClear={clearCart}
                                    />
                                }
                            />
                            <Route path="/borrowed" element={<BorrowedPage user={user} />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    )}
                </Routes>
            </div>
        </BrowserRouter>
    );
}
