import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminPage() {
    const [books, setBooks] = useState([]);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    // Add book form
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [copies, setCopies] = useState('1');
    const [year, setYear] = useState('');
    const [edition, setEdition] = useState('');

    const load = () => {
        api.listBooks().then(setBooks).catch(console.error);
    };

    useEffect(load, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.addBook({
                name,
                author,
                number_of_copies: Number(copies),
                publication_year: Number(year),
                edition,
            });
            setMsg('Book added!');
            setName(''); setAuthor(''); setCopies('1'); setYear(''); setEdition('');
            load();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (bookId) => {
        try {
            await api.removeBook(bookId);
            setMsg('Book removed.');
            load();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Library Admin</h1>
                <p>Add or remove books from the inventory</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            {/* ── Add Book Form ─────────────────────────────────────── */}
            <div className="glass" style={{ padding: 24, marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Add a Book</h2>
                <form onSubmit={handleAdd}>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label>Title</label>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Author</label>
                            <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group">
                            <label>Copies</label>
                            <input className="input" type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input className="input" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Edition</label>
                            <input className="input" value={edition} onChange={(e) => setEdition(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn btn-primary">Add Book</button>
                </form>
            </div>

            {/* ── Inventory ─────────────────────────────────────────── */}
            <div className="glass" style={{ padding: 20 }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Inventory ({books.length})</h2>
                {books.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No books yet.</p>
                ) : (
                    <table className="borrow-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Copies</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((b) => (
                                <tr key={b.book_id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{b.book_id}</td>
                                    <td>{b.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{b.author}</td>
                                    <td>{b.number_of_copies}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRemove(b.book_id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
