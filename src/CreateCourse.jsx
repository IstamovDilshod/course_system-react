import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './CreateCourse.css';

const CreateCourse = () => {
    const [courseData, setCourseData] = useState({ title: '', description: '', price: '' });
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCourseData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('courses/', courseData);
            navigate('/courses');
        } catch (err) {
            console.error(err);
            alert("Sizda ruxsat yo'q yoki xatolik yuz berdi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cc-wrapper">
            <div className="cc-card">
                <div className="cc-header">
                    <div className="cc-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h1 className="cc-title">Yangi kurs</h1>
                    <p className="cc-subtitle">Kurs ma'lumotlarini kiriting</p>
                </div>

                <form onSubmit={handleCreateCourse} className="cc-form">
                    <div className={`cc-field ${focused === 'title' ? 'cc-field--focused' : ''} ${courseData.title ? 'cc-field--filled' : ''}`}>
                        <label className="cc-label">Kurs nomi</label>
                        <input
                            type="text"
                            name="title"
                            className="cc-input"
                            value={courseData.title}
                            onChange={handleChange}
                            onFocus={() => setFocused('title')}
                            onBlur={() => setFocused('')}
                            required
                        />
                        <span className="cc-line" />
                    </div>

                    <div className={`cc-field ${focused === 'description' ? 'cc-field--focused' : ''} ${courseData.description ? 'cc-field--filled' : ''}`}>
                        <label className="cc-label">Tavsif</label>
                        <textarea
                            name="description"
                            className="cc-input cc-textarea"
                            value={courseData.description}
                            onChange={handleChange}
                            onFocus={() => setFocused('description')}
                            onBlur={() => setFocused('')}
                            rows={4}
                            required
                        />
                        <span className="cc-line" />
                    </div>

                    <div className={`cc-field ${focused === 'price' ? 'cc-field--focused' : ''} ${courseData.price ? 'cc-field--filled' : ''}`}>
                        <label className="cc-label">Narxi</label>
                        <div className="cc-price-wrap">
                            <span className="cc-currency">$</span>
                            <input
                                type="number"
                                name="price"
                                className="cc-input cc-input--price"
                                value={courseData.price}
                                onChange={handleChange}
                                onFocus={() => setFocused('price')}
                                onBlur={() => setFocused('')}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <span className="cc-line" />
                    </div>

                    <div className="cc-actions">
                        <button
                            type="button"
                            className="cc-btn cc-btn--secondary"
                            onClick={() => navigate('/courses')}
                            disabled={loading}
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className={`cc-btn cc-btn--primary ${loading ? 'cc-btn--loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="cc-spinner" />
                                    Saqlanmoqda...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cc-btn-icon">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Kurs qo'shish
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;