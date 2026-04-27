import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import './CourseList.css';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('-created_at');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate();

    const token = localStorage.getItem('access');
    const user = token ? jwtDecode(token) : null;

    const fetchCourses = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search)   params.append('search', search);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        if (sortBy)   params.append('ordering', sortBy);
        params.append('page', page);
        params.append('page_size', 6);

        api.get(`courses/?${params.toString()}`)
            .then(res => {
                if (res.data.results !== undefined) {
                    setCourses(res.data.results);
                    setTotalPages(res.data.pages || 1);
                    setTotalCount(res.data.total || 0);
                } else {
                    setCourses(res.data);
                    setTotalPages(1);
                    setTotalCount(res.data.length);
                }
            })
            .catch(err => console.error("Xatolik:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, sortBy, search, minPrice, maxPrice]);

    const deleteCourse = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
        setDeletingId(id);
        try {
            await api.delete(`courses/${id}/`);
            fetchCourses();
        } catch {
            alert("O'chirishda xatolik yuz berdi!");
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('-created_at');
        setPage(1);
    };

    const hasFilters = search || minPrice || maxPrice || sortBy !== '-created_at';

    return (
        <div className="cl-wrapper">
            <div className="cl-container">

                <div className="cl-header">
                    <div className="cl-header-left">
                        <span className="cl-tag">Katalog</span>
                        <h1 className="cl-title">Barcha kurslar</h1>
                    </div>
                    <div className="cl-header-right">
                        {user?.role === 'instructor' && (
                            <button className="cl-add-btn" onClick={() => navigate('/create-course')}>
                                + Kurs qo'shish
                            </button>
                        )}
                        {token && user?.role === 'student' && (
                            <button className="cl-mycourses-btn" onClick={() => navigate('/my-courses')}>
                                📚 Mening kurslarim
                            </button>
                        )}
                    </div>
                </div>

                <div className="cl-filters">
                    <div className="cl-search-wrap">
                        <svg className="cl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input type="text" className="cl-search" placeholder="Kurs nomi bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button className="cl-search-clear" onClick={() => setSearch('')}>✕</button>}
                    </div>

                    <div className="cl-price-range">
                        <input type="number" className="cl-filter-input" placeholder="Min ($)" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" />
                        <span className="cl-price-sep">—</span>
                        <input type="number" className="cl-filter-input" placeholder="Max ($)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
                    </div>

                    <select className="cl-sort" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                        <option value="-created_at">Yangi</option>
                        <option value="created_at">Eski</option>
                        <option value="price">Narx: arzon →</option>
                        <option value="-price">Narx: qimmat →</option>
                        <option value="title">A → Z</option>
                    </select>

                    {hasFilters && <button className="cl-clear-btn" onClick={clearFilters}>✕ Tozalash</button>}
                </div>

                {!loading && (
                    <p className="cl-result-count">
                        Jami <span>{totalCount}</span> ta kurs
                        {hasFilters && <span className="cl-filter-badge"> · filtr qo'llanilgan</span>}
                    </p>
                )}

                {loading && (
                    <div className="cl-grid">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="cl-skeleton">
                                <div className="cl-sk-accent" />
                                <div className="cl-sk-body">
                                    <div className="cl-sk-title" />
                                    <div className="cl-sk-text" />
                                    <div className="cl-sk-text cl-sk-text--short" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && courses.length === 0 && (
                    <div className="cl-empty">
                        <div className="cl-empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <p className="cl-empty-title">Kurs topilmadi</p>
                        <p className="cl-empty-sub">{hasFilters ? "Filtrni tozalab ko'ring" : "Hali kurslar yo'q"}</p>
                        {hasFilters && <button className="cl-clear-btn" onClick={clearFilters}>Filterni tozalash</button>}
                    </div>
                )}

                {!loading && courses.length > 0 && (
                    <div className="cl-grid">
                        {courses.map((course, i) => (
                            <div
                                key={course.id}
                                className="cl-card"
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => navigate(`/courses/${course.id}`)}
                            >
                                <div className="cl-card-accent" />
                                <div className="cl-card-body">
                                    <h3 className="cl-card-title">{course.title}</h3>
                                    <p className="cl-card-desc">{course.description}</p>
                                    <div className="cl-card-meta">
                                        <span>👨‍🏫 {course.instructor_name}</span>
                                        {course.lessons_count > 0 && <span>📚 {course.lessons_count} dars</span>}
                                        {course.avg_rating && <span>⭐ {course.avg_rating}</span>}
                                    </div>
                                </div>

                                <div className="cl-card-footer">
                                    <div className="cl-price">
                                        <span className="cl-price-symbol">$</span>
                                        <span className="cl-price-value">{course.price ?? '0'}</span>
                                    </div>

                                    {/* ✅ Faqat instructor o'z kurslarida ko'radi */}
                                    {user?.role === 'instructor' && String(user?.user_id) === String(course.instructor) && (
                                        <div className="cl-actions" onClick={e => e.stopPropagation()}>
                                            <button className="cl-btn cl-btn--edit" onClick={() => navigate(`/courses/${course.id}`)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                </svg>
                                                Tahrirlash
                                            </button>
                                            <button className="cl-btn cl-btn--delete" onClick={e => deleteCourse(e, course.id)} disabled={deletingId === course.id}>
                                                {deletingId === course.id
                                                    ? <span className="cl-spinner" />
                                                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                }
                                                O'chirish
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="cl-pagination">
                        <button className="cl-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Oldingi</button>
                        <div className="cl-pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} className={`cl-page-num ${p === page ? 'cl-page-num--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                            ))}
                        </div>
                        <button className="cl-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Keyingi →</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseList;