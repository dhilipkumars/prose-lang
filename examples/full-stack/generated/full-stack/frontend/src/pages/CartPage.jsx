import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CartPage({ user, cart, onRemove, onClear }) {
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCheckout = async () => {
        setError('');
        try {
            const bookIds = cart.map((b) => b.book_id);
            const data = await api.checkout(user.member_id, bookIds);
            setMsg(`${data.message} — return by ${data.expected_return}`);
            onClear();
            setTimeout(() => navigate('/borrowed'), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Your Cart</h1>
                <p>{cart.length} book{cart.length !== 1 ? 's' : ''} selected</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            {cart.length === 0 && !msg ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Your cart is empty. Browse the library to add books.
                </p>
            ) : (
                <>
                    <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                        <table className="borrow-table">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Author</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((b) => (
                                    <tr key={b.book_id}>
                                        <td>{b.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{b.author}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => onRemove(b.book_id)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {cart.length > 0 && (
                        <button className="btn btn-primary" onClick={handleCheckout}>
                            Checkout ({cart.length} book{cart.length !== 1 ? 's' : ''})
                        </button>
                    )}
                </>
            )}
        </>
    );
}
