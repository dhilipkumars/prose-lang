import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function BorrowedPage({ user }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const load = () => {
        setLoading(true);
        api.borrowedBooks(user.member_id)
            .then((data) => setBooks(data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, [user.member_id]);

    const handleReturn = async (bookId) => {
        try {
            await api.returnBook(user.member_id, bookId);
            setMsg('Book returned successfully!');
            load();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.message);
        }
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString();

    return (
        <>
            <div className="page-header">
                <h1>My Borrowed Books</h1>
                <p>Overdue books are highlighted in red</p>
            </div>

            {msg && <div className="alert alert-success">{msg}</div>}

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</p>
            ) : books.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    You have no borrowed books right now.
                </p>
            ) : (
                <div className="glass" style={{ padding: 20 }}>
                    <table className="borrow-table">
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Borrowed</th>
                                <th>Return By</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((b) => (
                                <tr key={b.id}>
                                    <td>{b.book_name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{fmtDate(b.borrow_date)}</td>
                                    <td className={b.is_overdue ? 'overdue' : ''}>
                                        {fmtDate(b.expected_return)}
                                    </td>
                                    <td className={b.is_overdue ? 'overdue' : ''}>
                                        {b.is_overdue ? '⚠ Overdue' : 'Active'}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleReturn(b.book_id)}>
                                            Return
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
