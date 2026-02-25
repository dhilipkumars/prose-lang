import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function BrowsePage({ user, cart, onAddToCart }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listBooks().then(setBooks).catch(console.error).finally(() => setLoading(false));
    }, []);

    const inCart = (id) => cart.some((b) => b.book_id === id);

    return (
        <>
            <div className="page-header">
                <h1>Browse Library</h1>
                <p>Select books to add to your cart</p>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading books…</p>
            ) : books.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No books in the library yet. Ask the librarian to add some!
                </p>
            ) : (
                <div className="grid grid-3">
                    {books.map((book) => (
                        <div key={book.book_id} className="book-card glass">
                            <h3>{book.name}</h3>
                            <div className="meta">
                                {book.author} · {book.publication_year} · {book.edition}
                            </div>
                            <span className={`copies ${book.number_of_copies > 0 ? 'copies-available' : 'copies-none'}`}>
                                {book.number_of_copies > 0
                                    ? `${book.number_of_copies} available`
                                    : 'Unavailable'}
                            </span>
                            <div className="actions">
                                <button
                                    className="btn btn-primary btn-sm"
                                    disabled={book.number_of_copies <= 0 || inCart(book.book_id)}
                                    onClick={() => onAddToCart(book)}
                                >
                                    {inCart(book.book_id) ? '✓ In Cart' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
