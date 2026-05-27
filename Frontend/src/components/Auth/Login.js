import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdEmail, MdLock, MdAutorenew } from 'react-icons/md';
import './Auth.css';

// Use the environment variable
const API_URL = process.env.REACT_APP_NODE_URL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);
                navigate('/');
                window.location.reload(); 
            } else {
                alert(data.message || "Invalid Credentials");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Cannot connect to the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p>Login to manage your bookings and explore deals.</p>
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="input-box">
                        <label><MdEmail /> Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required 
                        />
                    </div>
                    <div className="input-box">
                        <label><MdLock /> Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required 
                        />
                    </div>
                    <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? <><MdAutorenew className="ani-spin" /> Verifying...</> : "Login"}
                    </button>
                </form>
                <div className="auth-footer">
                    New to TravelGo? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;