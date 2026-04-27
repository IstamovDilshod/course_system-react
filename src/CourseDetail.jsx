import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import './CourseDetail.css';

/* ─── Star Rating ────────────────────────────────────────── */
const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="cd-stars">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`cd-star ${star <= (hovered || value) ? 'cd-star--on' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange && onChange(star)}
                >★</button>
            ))}
        </div>
    );
};

/* ─── Helper ─────────────────────────────────────────────── */
const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    return [];
};

const isUrl = (str = '') => {
    try { new URL(str); return true; } catch { return false; }
};

/* ─── Lesson Viewer Modal ────────────────────────────────── */
const LessonViewer = ({ lesson, onClose, lessonIndex, total }) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const videoUrl = lesson.video?.file || lesson.video || null;
    const hasVideo = !!videoUrl;
    const hasLink = !hasVideo && isUrl(lesson.content);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

                .lv-overlay {
                    position: fixed; inset: 0; z-index: 1000;
                    background: rgba(5, 6, 10, 0.92);
                    backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    animation: lv-fade .25s ease both;
                    font-family: 'Sora', sans-serif;
                }
                @keyframes lv-fade { from{opacity:0} to{opacity:1} }

                .lv-modal {
                    background: #111318;
                    border: 1px solid #1e2130;
                    border-radius: 22px;
                    width: 100%;
                    max-width: 820px;
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 40px 100px rgba(0,0,0,.7), 0 0 0 1px #1a1d28;
                    animation: lv-up .35s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes lv-up { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:none} }

                /* Top bar */
                .lv-topbar {
                    display: flex; align-items: center; gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #1e2130;
                    background: #0e1016;
                    flex-shrink: 0;
                }

                .lv-order {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px; font-weight: 500;
                    color: #6366f1;
                    background: rgba(99,102,241,.12);
                    border: 1px solid rgba(99,102,241,.25);
                    padding: 3px 10px;
                    border-radius: 20px;
                    flex-shrink: 0;
                }

                .lv-topbar-title {
                    flex: 1; min-width: 0;
                    font-size: 14px; font-weight: 600;
                    color: #e2e4f0;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }

                .lv-counter {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px; color: #454869;
                    flex-shrink: 0;
                }

                .lv-close {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    border: 1px solid #1e2130;
                    background: #161820;
                    color: #454869;
                    font-size: 16px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all .2s;
                    flex-shrink: 0;
                    line-height: 1;
                }
                .lv-close:hover { border-color: #e05c6a; color: #e05c6a; background: rgba(224,92,106,.08); }

                /* Scrollable body */
                .lv-body {
                    overflow-y: auto;
                    flex: 1;
                    scrollbar-width: thin;
                    scrollbar-color: #282b3a transparent;
                }

                /* Video */
                .lv-video-wrap {
                    background: #000;
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16/9;
                }
                .lv-video-wrap video {
                    width: 100%; height: 100%;
                    object-fit: contain;
                    display: block;
                }
                .lv-no-video {
                    aspect-ratio: 16/9;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 10px;
                    background: radial-gradient(ellipse at center, #161820, #0b0d12);
                    color: #282b3a;
                }
                .lv-no-video span { font-size: 44px; }
                .lv-no-video p { font-size: 12px; font-family: 'JetBrains Mono', monospace; }

                /* Content */
                .lv-content {
                    padding: 24px 28px 28px;
                    display: flex; flex-direction: column; gap: 18px;
                }

                .lv-section-label {
                    font-size: 10px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: .1em;
                    color: #454869; margin-bottom: 8px;
                }

                .lv-text {
                    font-size: 14px; line-height: 1.75;
                    color: #9094b0;
                }

                .lv-link-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 18px;
                    border-radius: 10px;
                    border: 1px solid #1e2130;
                    background: #161820;
                    color: #6366f1;
                    font-size: 13px; font-weight: 500;
                    text-decoration: none;
                    transition: all .2s;
                    max-width: 100%;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .lv-link-btn:hover { border-color: #6366f1; background: rgba(99,102,241,.08); }

                .lv-divider { height: 1px; background: #1e2130; }

                /* Video meta chips */
                .lv-chips {
                    display: flex; flex-wrap: wrap; gap: 8px;
                }
                .lv-chip {
                    display: flex; align-items: center; gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1px solid #1e2130;
                    background: #0e1016;
                    font-size: 11px;
                    font-family: 'JetBrains Mono', monospace;
                    color: #454869;
                }
                .lv-chip span { font-size: 13px; }

                @media (max-width: 600px) {
                    .lv-modal { border-radius: 16px; }
                    .lv-content { padding: 18px 16px 20px; }
                }
            `}</style>

            <div className="lv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="lv-modal">
                    {/* Top bar */}
                    <div className="lv-topbar">
                        <span className="lv-order">
                            {String(lessonIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="lv-topbar-title">{lesson.title}</span>
                        <span className="lv-counter">{lessonIndex + 1} / {total}</span>
                        <button className="lv-close" onClick={onClose}>✕</button>
                    </div>

                    {/* Scrollable */}
                    <div className="lv-body">
                        {/* Video */}
                        {hasVideo ? (
                            <div className="lv-video-wrap">
                                <video controls autoPlay key={videoUrl}>
                                    <source src={videoUrl} />
                                    Brauzeringiz video formatini qo'llab-quvvatlamaydi.
                                </video>
                            </div>
                        ) : (
                            <div className="lv-no-video">
                                <span>🎬</span>
                                <p>video mavjud emas</p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="lv-content">
                            {/* Meta chips */}
                            <div className="lv-chips">
                                {lesson.created_at && (
                                    <div className="lv-chip">
                                        <span>📅</span>
                                        {new Date(lesson.created_at).toLocaleDateString('uz-UZ', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                )}
                                {lesson.video?.duration > 0 && (
                                    <div className="lv-chip">
                                        <span>⏱</span>
                                        {(() => {
                                            const s = lesson.video.duration;
                                            const m = Math.floor(s / 60);
                                            return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
                                        })()}
                                    </div>
                                )}
                                {lesson.video?.size > 0 && (
                                    <div className="lv-chip">
                                        <span>💾</span>
                                        {(lesson.video.size / (1024 * 1024)).toFixed(1)} MB
                                    </div>
                                )}
                                {lesson.order !== undefined && (
                                    <div className="lv-chip">
                                        <span>📌</span>
                                        Tartib: {lesson.order}
                                    </div>
                                )}
                            </div>

                            <div className="lv-divider" />

                            {/* Text / link */}
                            <div>
                                <p className="lv-section-label">Dars matni</p>
                                {hasLink ? (
                                    <a
                                        href={lesson.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="lv-link-btn"
                                    >
                                        🔗 {lesson.content}
                                    </a>
                                ) : (
                                    <p className="lv-text">
                                        {lesson.content || <span style={{ color: '#282b3a' }}>Matn qo'shilmagan</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════ */
/*  CourseDetail                                               */
/* ═══════════════════════════════════════════════════════════ */
const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('lessons');

    const [lessonForm, setLessonForm] = useState({ title: '', content: '', order: 0 });
    const [lessonLoading, setLessonLoading] = useState(false);
    const [showLessonForm, setShowLessonForm] = useState(false);

    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);

    const [editingLesson, setEditingLesson] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', video: null });
    const [videoPreview, setVideoPreview] = useState(null);

    // ← NEW: which lesson is open in the viewer
    const [viewingLesson, setViewingLesson] = useState(null);

    const token = localStorage.getItem('access');
    const user = token ? jwtDecode(token) : null;
    const isInstructor = user?.role === 'instructor';
    const isOwner = user && course && String(course.instructor) === String(user.user_id);

    useEffect(() => {
        Promise.all([
            api.get(`courses/${id}/`),
            api.get(`courses/${id}/lessons/`),
            api.get(`courses/${id}/reviews/`),
        ])
            .then(([courseRes, lessonRes, reviewRes]) => {
                setCourse(courseRes.data);
                setLessons(toArray(lessonRes.data));
                setReviews(toArray(reviewRes.data));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        if (token) {
            api.get('my-courses/')
                .then(res => {
                    const data = toArray(res.data);
                    setEnrolled(data.some(e => String(e.course) === String(id)));
                })
                .catch(() => { });
        }
    }, [id]);

    const handleEnroll = async () => {
        if (!token) return navigate('/login');
        setEnrolling(true);
        try {
            await api.post('enroll/', { course: id });
            setEnrolled(true);
        } catch (err) {
            alert(err.response?.data?.detail || 'Xatolik yuz berdi!');
        } finally {
            setEnrolling(false);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        setLessonLoading(true);
        try {
            const res = await api.post(`courses/${id}/lessons/`, lessonForm);
            setLessons(prev => [...prev, res.data]);
            setLessonForm({ title: '', content: '', order: 0 });
            setShowLessonForm(false);
        } catch (err) {
            alert(err.response?.data?.detail || "Dars qo'shishda xatolik!");
        } finally {
            setLessonLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Darsni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`courses/${id}/lessons/${lessonId}/`);
            setLessons(prev => prev.filter(l => l.id !== lessonId));
        } catch {
            alert("O'chirishda xatolik!");
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.rating) return alert('Iltimos, baho bering!');
        setReviewLoading(true);
        try {
            const res = await api.post(`courses/${id}/reviews/`, reviewForm);
            setReviews(prev => [...prev, res.data]);
            setReviewForm({ rating: 0, comment: '' });
        } catch (err) {
            alert(err.response?.data?.detail || "Review qo'shishda xatolik!");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Reviewni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`courses/${id}/reviews/${reviewId}/`);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch {
            alert("O'chirishda xatolik!");
        }
    };

    const handleEditClick = (lesson) => {
        setEditingLesson(lesson);
        setEditForm({ title: lesson.title || '', content: lesson.content || '', video: null });
        setVideoPreview(lesson.video?.file || lesson.video || null);
    };

    const handleUpdateLesson = async () => {
        try {
            const formData = new FormData();
            formData.append('title', editForm.title);
            formData.append('content', editForm.content);
            if (editForm.video) formData.append('video', editForm.video);
            const res = await api.put(
                `courses/${id}/lessons/${editingLesson.id}/`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setLessons(prev => prev.map(l => l.id === editingLesson.id ? res.data : l));
            setEditingLesson(null);
            alert('Yangilandi ✅');
        } catch (error) {
            console.error(error);
            alert('Xatolik ❌');
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm(prev => ({ ...prev, video: file }));
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    // Can a student open the viewer?
    const canWatch = enrolled || isOwner;

    // Lesson click handler
    const handleLessonClick = (lesson) => {
        if (canWatch) setViewingLesson(lesson);
    };

    if (loading) return (
        <div className="cd-loading-screen">
            <div className="cd-spinner-lg" />
        </div>
    );

    if (!course) return (
        <div className="cd-loading-screen">
            <p style={{ color: '#64748b' }}>Kurs topilmadi.</p>
        </div>
    );

    return (
        <div className="cd-wrapper">
            <div className="cd-container">

                {/* ── Hero ── */}
                <div className="cd-hero">
                    <button className="cd-back" onClick={() => navigate('/courses')}>← Orqaga</button>
                    <div className="cd-hero-body">
                        <div className="cd-hero-left">
                            <span className="cd-tag">Kurs</span>
                            <h1 className="cd-title">{course.title}</h1>
                            <p className="cd-desc">{course.description}</p>
                            <div className="cd-meta">
                                <span className="cd-meta-item">📚 {lessons.length} ta dars</span>
                                {avgRating && <span className="cd-meta-item">⭐ {avgRating} ({reviews.length} baho)</span>}
                                <span className="cd-meta-item">👨‍🏫 {course.instructor_name}</span>
                            </div>
                        </div>

                        <div className="cd-hero-right">
                            <div className="cd-price-card">
                                <p className="cd-price-label">Narxi</p>
                                <p className="cd-price">${course.price}</p>

                                {!isInstructor && (
                                    enrolled ? (
                                        <div className="cd-enrolled-badge">✅ Yozilgansiz</div>
                                    ) : (
                                        <button className="cd-enroll-btn" onClick={handleEnroll} disabled={enrolling}>
                                            {enrolling ? 'Yuklanmoqda...' : 'Kursga yozilish'}
                                        </button>
                                    )
                                )}

                                {isOwner && (
                                    <button className="cd-add-lesson-btn" onClick={() => setShowLessonForm(o => !o)}>
                                        {showLessonForm ? '✕ Yopish' : "+ Dars qo'shish"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Lesson form ── */}
                {isOwner && showLessonForm && (
                    <div className="cd-panel">
                        <h2 className="cd-panel-title">Yangi dars qo'shish</h2>
                        <form onSubmit={handleAddLesson} className="cd-lesson-form">
                            <div className="cd-form-row">
                                <div className="cd-field">
                                    <label>Dars nomi</label>
                                    <input
                                        type="text"
                                        value={lessonForm.title}
                                        onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Masalan: Python asoslari"
                                        required
                                    />
                                </div>
                                <div className="cd-field cd-field--sm">
                                    <label>Tartib</label>
                                    <input
                                        type="number"
                                        value={lessonForm.order}
                                        onChange={e => setLessonForm(p => ({ ...p, order: +e.target.value }))}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="cd-field">
                                <label>Kontent (matn yoki video link)</label>
                                <textarea
                                    value={lessonForm.content}
                                    onChange={e => setLessonForm(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Dars mazmuni yoki YouTube link..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="cd-form-actions">
                                <button type="button" className="cd-btn cd-btn--ghost" onClick={() => setShowLessonForm(false)}>Bekor</button>
                                <button type="submit" className="cd-btn cd-btn--primary" disabled={lessonLoading}>
                                    {lessonLoading ? 'Saqlanmoqda...' : "+ Dars qo'shish"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Tabs ── */}
                <div className="cd-tabs">
                    <button className={`cd-tab ${activeTab === 'lessons' ? 'cd-tab--active' : ''}`} onClick={() => setActiveTab('lessons')}>
                        📚 Darslar ({lessons.length})
                    </button>
                    <button className={`cd-tab ${activeTab === 'reviews' ? 'cd-tab--active' : ''}`} onClick={() => setActiveTab('reviews')}>
                        ⭐ Baholar ({reviews.length})
                    </button>
                </div>

                {/* ── Lessons ── */}
                {activeTab === 'lessons' && (
                    <div className="cd-panel">
                        {lessons.length === 0 ? (
                            <div className="cd-empty"><span>📖</span><p>Hali darslar qo'shilmagan</p></div>
                        ) : (
                            <div className="cd-lesson-list">
                                {lessons.map((lesson, i) => (
                                    <div
                                        key={lesson.id}
                                        className={`cd-lesson-item${canWatch ? ' cd-lesson-item--clickable' : ''}`}
                                        onClick={() => handleLessonClick(lesson)}
                                        title={canWatch ? 'Darsni ochish' : 'Kursga yoziling'}
                                    >
                                        <div className="cd-lesson-left">
                                            <span className="cd-lesson-num">{String(i + 1).padStart(2, '0')}</span>
                                            <div>
                                                <p className="cd-lesson-title">{lesson.title}</p>
                                                <p className="cd-lesson-content">{lesson.content}</p>
                                            </div>
                                        </div>

                                        {/* play icon for enrolled */}
                                        {canWatch && !isOwner && (
                                            <span className="cd-play-icon">▶</span>
                                        )}

                                        {/* owner actions — stop propagation so click doesn't open viewer */}
                                        {isOwner && (
                                            <>
                                                <button
                                                    className="cd-edit-btn"
                                                    onClick={e => { e.stopPropagation(); navigate(`/courses/${id}/lessons/${lesson.id}/edit`); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6d6fe7">
                                                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="cd-del-btn"
                                                    onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323">
                                                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                                    </svg>
                                                </button>
                                                {/* owner can also preview */}
                                                <button
                                                    className="cd-play-icon cd-play-icon--btn"
                                                    onClick={e => { e.stopPropagation(); setViewingLesson(lesson); }}
                                                    title="Ko'rish"
                                                >▶</button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* hint for non-enrolled students */}
                        {!canWatch && lessons.length > 0 && (
                            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#454869' }}>
                                🔒 Darslarni ko'rish uchun kursga yoziling
                            </p>
                        )}
                    </div>
                )}

                {/* ── Reviews ── */}
                {activeTab === 'reviews' && (
                    <div className="cd-panel">
                        {token && !isInstructor && (
                            <form onSubmit={handleAddReview} className="cd-review-form">
                                <h3 className="cd-review-form-title">Baho qoldiring</h3>
                                <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                                    placeholder="Izoh qoldiring (ixtiyoriy)..."
                                    rows={3}
                                />
                                <button type="submit" className="cd-btn cd-btn--primary" disabled={reviewLoading}>
                                    {reviewLoading ? 'Yuborilmoqda...' : 'Baho yuborish'}
                                </button>
                            </form>
                        )}

                        {reviews.length === 0 ? (
                            <div className="cd-empty"><span>⭐</span><p>Hali baholar yo'q</p></div>
                        ) : (
                            <div className="cd-review-list">
                                {reviews.map(review => (
                                    <div key={review.id} className="cd-review-item">
                                        <div className="cd-review-header">
                                            <div className="cd-review-avatar">{review.username?.[0]?.toUpperCase()}</div>
                                            <div>
                                                <p className="cd-review-name">{review.username}</p>
                                                <StarRating value={review.rating} />
                                            </div>
                                            {user?.username === review.username && (
                                                <button className="cd-del-btn" onClick={() => handleDeleteReview(review.id)}>🗑</button>
                                            )}
                                        </div>
                                        {review.comment && <p className="cd-review-comment">{review.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Lesson Viewer ── */}
            {viewingLesson && (
                <LessonViewer
                    lesson={viewingLesson}
                    lessonIndex={lessons.findIndex(l => l.id === viewingLesson.id)}
                    total={lessons.length}
                    onClose={() => setViewingLesson(null)}
                />
            )}
        </div>
    );
};

export default CourseDetail;