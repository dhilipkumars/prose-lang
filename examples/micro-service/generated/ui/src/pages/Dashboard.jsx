import { useState, useEffect, useCallback } from 'react';
import { containerApi, productApi } from '../api.js';

function Dashboard() {
    const [containers, setContainers] = useState([]);
    const [products, setProducts] = useState({});
    const [stats, setStats] = useState({ containers: 0, products: 0, totalValue: 0 });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const filters = search ? { containerName: search } : {};
            const containerData = await containerApi.list(page, 5, filters);
            setContainers(containerData.content);
            setTotalPages(containerData.totalPages);
            setTotalElements(containerData.totalElements);

            // Fetch product details for each unique productId
            const productIds = [...new Set(containerData.content.map((c) => c.productId))];
            const productMap = { ...products };
            await Promise.all(
                productIds
                    .filter((id) => !productMap[id])
                    .map(async (id) => {
                        try {
                            const p = await productApi.getById(id);
                            if (p) productMap[id] = p;
                        } catch {
                            // Product not found
                        }
                    })
            );
            setProducts(productMap);

            // Fetch stats
            const allContainers = await containerApi.list(0, 1, {});
            const allProducts = await productApi.list(0, 1, {});
            setStats({
                containers: allContainers.totalElements,
                products: allProducts.totalElements,
                totalValue: 0,
            });
        } catch (err) {
            console.error('Dashboard load failed:', err);
        }
        setLoading(false);
    }, [page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getProductAmount = (productId) => {
        const p = products[productId];
        return p ? `$${Number(p.productAmount).toFixed(2)}` : '—';
    };

    const getProductName = (productId) => {
        const p = products[productId];
        return p ? p.productName : `Product #${productId}`;
    };

    return (
        <div>
            <div className="page-header">
                <h1>📊 Shipyard Dashboard</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <span className="stat-label">Total Containers</span>
                    <span className="stat-value">{stats.containers}</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{stats.products}</span>
                </div>
                <div className="stat-card warning">
                    <span className="stat-label">Active Page</span>
                    <span className="stat-value">{page + 1}/{totalPages || 1}</span>
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                    <h2>Containers with Product Details</h2>
                </div>

                <div className="search-bar">
                    <input
                        className="form-control"
                        placeholder="Filter by container name..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    />
                </div>

                {loading ? (
                    <div className="spinner">Loading...</div>
                ) : containers.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📊</div>
                        <p>No containers found</p>
                    </div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Container ID</th>
                                    <th>Container Name</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Units</th>
                                </tr>
                            </thead>
                            <tbody>
                                {containers.map((c) => (
                                    <tr key={c.containerId}>
                                        <td style={{ color: 'var(--color-text)', fontWeight: 600 }}>#{c.containerId}</td>
                                        <td style={{ color: 'var(--color-text)' }}>{c.containerName}</td>
                                        <td>{getProductName(c.productId)}</td>
                                        <td><span className="price-badge">{getProductAmount(c.productId)}</span></td>
                                        <td>{c.quantity}</td>
                                        <td>{c.units}</td>
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
        </div>
    );
}

export default Dashboard;
