import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from './api';
import './Register.css';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('register/', formData);
            navigate('/login');
        } catch (error) {
            if (error.response?.status === 400) {
                setError("Bu username allaqachon band yoki ma'lumotlar xato!");
            } else {
                setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-wrapper">
            <div className="reg-container">

                {/* Left side */}
                <div className="reg-left">
                    <div className="reg-left-content">
                        <h1 className="reg-left-title">Xush kelibsiz!</h1>
                        <p className="reg-left-sub">Allaqachon hisobingiz bormi?</p>
                        <Link to="/login" className="reg-left-btn">Kirish</Link>
                    </div>
                    <div className="reg-orb reg-orb--1" />
                    <div className="reg-orb reg-orb--2" />
                </div>

                {/* Right side */}
                <div className="reg-right">
                    <div className="reg-form-box">
                        <div className="reg-header">
                            <h2 className="reg-title">Ro'yxatdan o'tish</h2>
                            <p className="reg-subtitle">O'rganishni boshlang</p>
                        </div>

                        <form onSubmit={handleRegister} className="reg-form">
                            <div className="reg-field">
                                <label>Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="username"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="reg-field">
                                <label>Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="reg-field">
                                <label>Parol</label>
                                <div className="reg-password-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="reg-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="reg-field">
                                <label>Rol</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="student">🎓 Student</option>
                                    <option value="instructor">👨‍🏫 Instructor</option>
                                </select>
                            </div>

                            {error && (
                                <div className="reg-error">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="reg-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="reg-spinner" />
                                        Yuklanmoqda...
                                    </>
                                ) : (
                                    "Ro'yxatdan o'tish"
                                )}
                            </button>

                            <p className="reg-footer-text">
                                Hisobingiz bormi? <Link to="/login">Kirish</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;