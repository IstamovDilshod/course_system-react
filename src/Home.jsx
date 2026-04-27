import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import './Home.css';

// ✅ Pagination yoki oddiy array formatini arrayga aylantirish
const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    return [];
};

function Home() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const navigate = useNavigate();

    // Token decode
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch {
                setUser(null);
            }
        }
    }, []);

    // Kurslarni yuklash
    useEffect(() => {
        api.get('courses/')
            .then(res => setCourses(toArray(res.data)))  // ✅ pagination format
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Soat
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const greeting = () => {
        const h = time.getHours();
        if (h < 6)  return 'Xayrli tun';
        if (h < 12) return 'Xayrli tong';
        if (h < 17) return 'Xayrli kun';
        if (h < 21) return 'Xayrli kech';
        return 'Xayrli tun';
    };

    const isInstructor = user?.role === 'instructor';
    const myCourses = isInstructor
        ? courses.filter(c => String(c.instructor) === String(user?.user_id))
        : courses;

    return (
        <div className="hm-wrapper">
            <div className="hm-container">

                {/* ── Hero ── */}
                <div className="hm-hero">
                    <div className="hm-hero-left">
                        <p className="hm-time">
                            {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                            <span className="hm-date">{time.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </p>
                        <h1 className="hm-greeting">
                            {greeting()},<br />
                            <span className="hm-username">{user?.username || 'Foydalanuvchi'}</span> 👋
                        </h1>
                        <span className={`hm-role-badge ${isInstructor ? 'hm-role--ins' : 'hm-role--stu'}`}>
                            {isInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
                        </span>
                    </div>
                    <div className="hm-hero-art">
                        <div className="hm-orb hm-orb--1" />
                        <div className="hm-orb hm-orb--2" />
                        <div className="hm-orb hm-orb--3" />
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="hm-stats">
                    <div className="hm-stat">
                        <span className="hm-stat-num">{courses.length}</span>
                        <span className="hm-stat-label">Jami kurslar</span>
                    </div>
                    <div className="hm-stat">
                        <span className="hm-stat-num">{myCourses.length}</span>
                        <span className="hm-stat-label">{isInstructor ? "Mening kurslarim" : "Mavjud kurslar"}</span>
                    </div>
                    <div className="hm-stat">
                        <span className="hm-stat-num">0</span>
                        <span className="hm-stat-label">Xabarlar</span>
                    </div>
                </div>

                {/* ── Grid ── */}
                <div className="hm-grid">

                    {/* Kurslar bo'limi */}
                    <div className="hm-panel hm-panel--wide">
                        <div className="hm-panel-head">
                            <div>
                                <h2 className="hm-panel-title">
                                    {isInstructor ? "Mening kurslarim" : "Barcha kurslar"}
                                </h2>
                                <p className="hm-panel-sub">{myCourses.length} ta kurs mavjud</p>
                            </div>
                            {isInstructor && (
                                <button className="hm-btn hm-btn--primary" onClick={() => navigate('/create-course')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Kurs qo'shish
                                </button>
                            )}
                            {!isInstructor && (
                                <button className="hm-btn hm-btn--ghost" onClick={() => navigate('/courses')}>
                                    Barchasini ko'rish →
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="hm-course-list">
                                {[1,2,3].map(i => (
                                    <div key={i} className="hm-course-skeleton">
                                        <div className="hm-sk-title" />
                                        <div className="hm-sk-text" />
                                    </div>
                                ))}
                            </div>
                        ) : myCourses.length === 0 ? (
                            <div className="hm-empty">
                                <span className="hm-empty-icon">📚</span>
                                <p>{isInstructor ? "Hali kurs qo'shmagansiz" : "Kurslar mavjud emas"}</p>
                                {isInstructor && (
                                    <button className="hm-btn hm-btn--primary" onClick={() => navigate('/create-course')}>
                                        Birinchi kursni yarating
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="hm-course-list">
                                {myCourses.slice(0, 4).map((course, i) => (
                                    <div key={course.id} className="hm-course-item" style={{ animationDelay: `${i * 60}ms` }}>
                                        <div className="hm-course-info">
                                            <div className="hm-course-num">{String(i + 1).padStart(2, '0')}</div>
                                            <div>
                                                <p className="hm-course-title">{course.title}</p>
                                                <p className="hm-course-desc">{course.description}</p>
                                            </div>
                                        </div>
                                        <span className="hm-course-price">${course.price ?? '0'}</span>
                                    </div>
                                ))}
                                {myCourses.length > 4 && (
                                    <button className="hm-show-more" onClick={() => navigate('/courses')}>
                                        Yana {myCourses.length - 4} ta kurs →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* O'ng panel */}
                    <div className="hm-side">

                        {/* Tez harakatlar */}
                        <div className="hm-panel">
                            <h2 className="hm-panel-title">Tez harakatlar</h2>
                            <div className="hm-actions">
                                {isInstructor ? (
                                    <>
                                        <button className="hm-action" onClick={() => navigate('/create-course')}>
                                            <span className="hm-action-icon">➕</span>
                                            <span>Kurs qo'shish</span>
                                        </button>
                                        <button className="hm-action" onClick={() => navigate('/courses')}>
                                            <span className="hm-action-icon">📋</span>
                                            <span>Kurslar ro'yxati</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="hm-action" onClick={() => navigate('/courses')}>
                                            <span className="hm-action-icon">🔍</span>
                                            <span>Kurslarni ko'rish</span>
                                        </button>
                                        <button className="hm-action" onClick={() => navigate('/my-courses')}>
                                            <span className="hm-action-icon">🛒</span>
                                            <span>Sotib olinganlar</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Xabarlar */}
                        <div className="hm-panel">
                            <div className="hm-panel-head">
                                <h2 className="hm-panel-title">Xabarlar</h2>
                                <span className="hm-badge">0</span>
                            </div>
                            <div className="hm-messages">
                                <div className="hm-no-msg">
                                    <span>💬</span>
                                    <p>Hozircha xabar yo'q</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;