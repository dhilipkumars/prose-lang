import React, { useState } from 'react';
import { api } from '../api';

export default function AuthPage({ onLogin, onAdminLogin }) {
    const [tab, setTab] = useState('login');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login state
    const [loginName, setLoginName] = useState('');
    const [loginId, setLoginId] = useState('');

    // Register state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    // Admin state
    const [adminPass, setAdminPass] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api.login({ username: loginName, member_id: Number(loginId) });
            onLogin({ member_id: data.member_id, name: data.name });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const data = await api.register({
                first_name: firstName,
                last_name: lastName,
                age: Number(age),
                email,
                address,
            });
            setSuccess(`Welcome! Your Member ID is ${data.member_id}. Switch to Login to enter.`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPass === 'password') {
            onAdminLogin();
        } else {
            setError('Invalid admin password');
        }
    };

    return (
        <div className="auth-container glass">
            <div className="page-header">
                <h1>📚 Book Library</h1>
                <p>Manage your reading life</p>
            </div>

            <div className="auth-tabs">
                <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
                    Login
                </button>
                <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
                    Register
                </button>
                <button className={`auth-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => { setTab('admin'); setError(''); setSuccess(''); }}>
                    Librarian
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {tab === 'login' && (
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input className="input" placeholder="Your name" value={loginName} onChange={(e) => setLoginName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Member ID</label>
                        <input className="input" type="number" placeholder="e.g. 1" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
            )}

            {tab === 'register' && (
                <form onSubmit={handleRegister}>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label>First Name</label>
                            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label>Age</label>
                            <input className="input" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
            )}

            {tab === 'admin' && (
                <form onSubmit={handleAdminLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input className="input" value="admin" disabled />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Enter password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Login as Librarian</button>
                </form>
            )}
        </div>
    );
}
