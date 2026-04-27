import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './MyCourses.css';

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('my-courses/')
            .then(res => setEnrollments(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (str) => {
        return new Date(str).toLocaleDateString('uz-UZ', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="mc-wrapper">
            <div className="mc-container">

                {/* Header */}
                <div className="mc-header">
                    <button className="mc-back" onClick={() => navigate('/courses')}>← Orqaga</button>
                    <div>
                        <span className="mc-tag">Mening kurslarim</span>
                        <h1 className="mc-title">Sotib olingan kurslar</h1>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="mc-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="mc-skeleton">
                                <div className="mc-sk-title" />
                                <div className="mc-sk-text" />
                                <div className="mc-sk-text mc-sk-text--short" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && enrollments.length === 0 && (
                    <div className="mc-empty">
                        <span className="mc-empty-icon">🎓</span>
                        <p className="mc-empty-title">Hali kurs sotib olmagansiz</p>
                        <p className="mc-empty-sub">Kurslarga qarang va o'rganishni boshlang!</p>
                        <button className="mc-btn mc-btn--primary" onClick={() => navigate('/courses')}>
                            Kurslarni ko'rish
                        </button>
                    </div>
                )}

                {/* Grid */}
                {!loading && enrollments.length > 0 && (
                    <>
                        <p className="mc-count">{enrollments.length} ta kursga yozilgansiz</p>
                        <div className="mc-grid">
                            {enrollments.map((enrollment, i) => (
                                <div
                                    key={enrollment.id}
                                    className="mc-card"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                    onClick={() => navigate(`/courses/${enrollment.course}`)}
                                >
                                    <div className="mc-card-accent" />
                                    <div className="mc-card-body">
                                        <div className="mc-card-icon">📚</div>
                                        <div>
                                            <h3 className="mc-card-title">{enrollment.course_title}</h3>
                                            <p className="mc-card-date">
                                                Yozilgan sana: {formatDate(enrollment.enrolled_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mc-card-footer">
                                        <span className="mc-enrolled-badge">✅ Yozilgansiz</span>
                                        <button
                                            className="mc-btn mc-btn--ghost"
                                            onClick={e => {
                                                e.stopPropagation();
                                                navigate(`/courses/${enrollment.course}`);
                                            }}
                                        >
                                            Kursni ochish →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyCourses;