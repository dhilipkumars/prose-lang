import { useState, useEffect, useCallback } from 'react';
import { containerApi } from '../api.js';

function Containers() {
    const [containers, setContainers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({
        containerName: '', productId: '', quantity: '', units: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchContainers = useCallback(async () => {
        setLoading(true);
        try {
            const filters = search ? { containerName: search } : {};
            const data = await containerApi.list(page, 10, filters);
            setContainers(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            showToast('Failed to load containers', 'error');
        }
        setLoading(false);
    }, [page, search]);

    useEffect(() => { fetchContainers(); }, [fetchContainers]);

    const resetForm = () => {
        setForm({ containerName: '', productId: '', quantity: '', units: '' });
        setEditing(null);
    };

    const openCreate = () => { resetForm(); setShowModal(true); };
    const openEdit = (c) => {
        setForm({
            containerName: c.containerName,
            productId: String(c.productId),
            quantity: String(c.quantity),
            units: c.units,
        });
        setEditing(c.containerId);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            containerName: form.containerName,
            productId: Number(form.productId),
            quantity: Number(form.quantity),
            units: form.units,
        };
        try {
            if (editing) {
                await containerApi.update(editing, payload);
                showToast('Container updated');
            } else {
                await containerApi.create(payload);
                showToast('Container created');
            }
            setShowModal(false);
            resetForm();
            fetchContainers();
        } catch (err) {
            showToast('Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this container?')) return;
        try {
            await containerApi.delete(id);
            showToast('Container deleted');
            fetchContainers();
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>📦 Containers</h1>
                <button className="btn btn-primary" onClick={openCreate}>+ Add Container</button>
            </div>

            <div className="search-bar">
                <input
                    className="form-control"
                    placeholder="Search by container name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
            </div>

            <div className="card">
                {loading ? (
                    <div className="spinner">Loading...</div>
                ) : containers.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📦</div>
                        <p>No containers found</p>
                    </div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Product ID</th>
                                    <th>Quantity</th>
                                    <th>Units</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {containers.map((c) => (
                                    <tr key={c.containerId}>
                                        <td style={{ color: 'var(--color-text)', fontWeight: 600 }}>#{c.containerId}</td>
                                        <td style={{ color: 'var(--color-text)' }}>{c.containerName}</td>
                                        <td>{c.productId}</td>
                                        <td>{c.quantity}</td>
                                        <td>{c.units}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} style={{ marginRight: 6 }}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.containerId)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <span className="pagination-info">
                                Showing {containers.length} of {totalElements} containers
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
                        <h2>{editing ? 'Edit Container' : 'Add Container'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Container Name</label>
                                <input className="form-control" required value={form.containerName}
                                    onChange={(e) => setForm({ ...form, containerName: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product ID</label>
                                    <input className="form-control" type="number" required value={form.productId}
                                        onChange={(e) => setForm({ ...form, productId: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input className="form-control" type="number" required value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Units</label>
                                <input className="form-control" required value={form.units}
                                    onChange={(e) => setForm({ ...form, units: e.target.value })} />
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

export default Containers;
