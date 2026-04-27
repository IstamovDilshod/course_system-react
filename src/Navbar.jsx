import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import './Navbar.css';

function Navbar() {
    const [token, setToken] = useState(localStorage.getItem('access'));
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState({ username: '', password: '', confirmPassword: '' });
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
                setProfileData(prev => ({ ...prev, username: decoded.username || '' }));
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    useEffect(() => {
        const handleStorageChange = () => setToken(localStorage.getItem('access'));
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
                setEditMode(false);
                setMessage(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Route o'zgarganda dropdown yopilsin
    useEffect(() => {
        setProfileOpen(false);
        setEditMode(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setToken(null);
        setUser(null);
        setProfileOpen(false);
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            setMessage({ type: 'error', text: 'Parollar mos kelmayapti!' });
            return;
        }
        setSaving(true);
        try {
            const payload = { username: profileData.username };
            if (profileData.password) payload.password = profileData.password;
            await api.patch('profile/', payload);
            setMessage({ type: 'success', text: 'Muvaffaqiyatli saqlandi!' });
            setEditMode(false);
            setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Xatolik yuz berdi!' });
        } finally {
            setSaving(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    const roleLabel = user?.role === 'instructor' ? 'Instructor' : user?.role === 'student' ? 'Student' : null;
    const roleClass = user?.role === 'instructor' ? 'role--instructor' : 'role--student';
    const avatarLetter = (user?.username || 'U').toString()[0].toUpperCase();

    return (
        <nav className="nb">
            <div className="nb-inner">

                {/* Logo */}
                <Link to="/" className="nb-logo">
                    Course<span>Manager</span>
                </Link>

                {/* Links */}
                <ul className="nb-links">
                    <li>
                        <Link to="/" className={`nb-link ${isActive('/') ? 'nb-link--active' : ''}`}>
                            Bosh Sahifa
                        </Link>
                    </li>
                    <li>
                        <Link to="/courses" className={`nb-link ${isActive('/courses') ? 'nb-link--active' : ''}`}>
                            Kurslar
                        </Link>
                    </li>
                    {token && user?.role === 'student' && (
                        <li>
                            <Link to="/my-courses" className={`nb-link ${isActive('/my-courses') ? 'nb-link--active' : ''}`}>
                                📚 Mening kurslarim
                            </Link>
                        </li>
                    )}
                    {token && user?.role === 'instructor' && (
                        <li>
                            <Link to="/create-course" className="nb-link nb-link--accent">
                                + Kurs qo'shish
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Right */}
                <div className="nb-right">
                    {!token ? (
                        <>
                            <Link to="/login" className="nb-btn nb-btn--ghost">Log In</Link>
                            <Link to="/register" className="nb-btn nb-btn--primary">Sign Up</Link>
                        </>
                    ) : (
                        <div className="nb-profile" ref={dropdownRef}>
                            <button className="nb-avatar" onClick={() => { setProfileOpen(o => !o); setEditMode(false); setMessage(null); }}>
                                <span className="nb-avatar-letter">{avatarLetter}</span>
                                {roleLabel && <span className={`nb-role ${roleClass}`}>{roleLabel}</span>}
                                <svg className={`nb-chevron ${profileOpen ? 'nb-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileOpen && (
                                <div className="nb-dropdown">
                                    <div className="nb-drop-header">
                                        <div className="nb-drop-avatar">{avatarLetter}</div>
                                        <div>
                                            <p className="nb-drop-name">{user?.username || 'Foydalanuvchi'}</p>
                                            {roleLabel && <span className={`nb-role nb-role--sm ${roleClass}`}>{roleLabel}</span>}
                                        </div>
                                    </div>

                                    <div className="nb-divider" />

                                    {/* My courses shortcut for student */}
                                    {user?.role === 'student' && (
                                        <button className="nb-drop-item" onClick={() => navigate('/my-courses')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                            </svg>
                                            Mening kurslarim
                                        </button>
                                    )}

                                    {!editMode ? (
                                        <button className="nb-drop-item" onClick={() => setEditMode(true)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                            </svg>
                                            Profilni tahrirlash
                                        </button>
                                    ) : (
                                        <div className="nb-edit-form">
                                            <div className="nb-edit-field">
                                                <label>Username</label>
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    onChange={e => setProfileData(p => ({ ...p, username: e.target.value }))}
                                                    placeholder="Yangi username"
                                                />
                                            </div>
                                            <div className="nb-edit-field">
                                                <label>Yangi parol</label>
                                                <input
                                                    type="password"
                                                    value={profileData.password}
                                                    onChange={e => setProfileData(p => ({ ...p, password: e.target.value }))}
                                                    placeholder="Bo'sh = o'zgarmaydi"
                                                />
                                            </div>
                                            <div className="nb-edit-field">
                                                <label>Parolni tasdiqlang</label>
                                                <input
                                                    type="password"
                                                    value={profileData.confirmPassword}
                                                    onChange={e => setProfileData(p => ({ ...p, confirmPassword: e.target.value }))}
                                                    placeholder="Parolni qaytaring"
                                                />
                                            </div>
                                            {message && (
                                                <p className={`nb-message ${message.type === 'success' ? 'nb-message--ok' : 'nb-message--err'}`}>
                                                    {message.text}
                                                </p>
                                            )}
                                            <div className="nb-edit-actions">
                                                <button className="nb-edit-btn nb-edit-btn--cancel" onClick={() => { setEditMode(false); setMessage(null); }}>
                                                    Bekor
                                                </button>
                                                <button className="nb-edit-btn nb-edit-btn--save" onClick={handleSaveProfile} disabled={saving}>
                                                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="nb-divider" />

                                    <button className="nb-drop-item nb-drop-item--danger" onClick={handleLogout}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                        Chiqish
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;