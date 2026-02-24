import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api.js';

function Products() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({
        productName: '', productDescription: '', productAmount: '', productQuantity: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const filters = search ? { productName: search } : {};
            const data = await productApi.list(page, 10, filters);
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            showToast('Failed to load products', 'error');
        }
        setLoading(false);
    }, [page, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const resetForm = () => {
        setForm({ productName: '', productDescription: '', productAmount: '', productQuantity: '' });
        setEditing(null);
    };

    const openCreate = () => { resetForm(); setShowModal(true); };
    const openEdit = (p) => {
        setForm({
            productName: p.productName,
            productDescription: p.productDescription || '',
            productAmount: String(p.productAmount),
            productQuantity: String(p.productQuantity),
        });
        setEditing(p.productId);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            productName: form.productName,
            productDescription: form.productDescription,
            productAmount: Number(form.productAmount),
            productQuantity: Number(form.productQuantity),
        };
        try {
            if (editing) {
                await productApi.update(editing, payload);
                showToast('Product updated');
            } else {
                await productApi.create(payload);
                showToast('Product created');
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (err) {
            showToast('Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await productApi.delete(id);
            showToast('Product deleted');
            fetchProducts();
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

    return (
        <div>
            <div className="page-header">
                <h1>🏷️ Products</h1>
                <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
            </div>

            <div className="search-bar">
                <input
                    className="form-control"
                    placeholder="Search by product name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
            </div>

            <div className="card">
                {loading ? (
                    <div className="spinner">Loading...</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🏷️</div>
                        <p>No products found</p>
                    </div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.productId}>
                                        <td style={{ color: 'var(--color-text)', fontWeight: 600 }}>#{p.productId}</td>
                                        <td style={{ color: 'var(--color-text)' }}>{p.productName}</td>
                                        <td>{p.productDescription || '—'}</td>
                                        <td><span className="price-badge">{formatPrice(p.productAmount)}</span></td>
                                        <td>{p.productQuantity}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 6 }}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.productId)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <span className="pagination-info">
                                Showing {products.length} of {totalElements} products
                            </span>
                            <div className="pagination-controls">
                                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
                                <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input className="form-control" required value={form.productName}
                                    onChange={(e) => setForm({ ...form, productName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input className="form-control" value={form.productDescription}
                                    onChange={(e) => setForm({ ...form, productDescription: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input className="form-control" type="number" step="0.01" required value={form.productAmount}
                                        onChange={(e) => setForm({ ...form, productAmount: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input className="form-control" type="number" required value={form.productQuantity}
                                        onChange={(e) => setForm({ ...form, productQuantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </div>
    );
}

export default Products;
