import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api';
import './CourseDetail.css';

const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="cd-stars">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                    className={`cd-star ${star <= (hovered || value) ? 'cd-star--on' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange && onChange(star)}
                >★</button>
            ))}
        </div>
    );
};

const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    return [];
};

// ── Payment Modal ─────────────────────────────────────────────────────────────
const PaymentModal = ({ course, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    const formatCard   = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = v => { const c = v.replace(/\D/g, '').slice(0, 4); return c.length >= 2 ? c.slice(0,2) + '/' + c.slice(2) : c; };

    const handlePay = async () => {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
            setError("Barcha maydonlarni to'ldiring!"); return;
        }
        setPaying(true); setError('');
        try {
            await new Promise(r => setTimeout(r, 1800));
            await api.post('enroll/', { course: course.id });
            setStep(3);
            setTimeout(() => { onSuccess(); onClose(); }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "To'lovda xatolik!");
        } finally { setPaying(false); }
    };

    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-modal" onClick={e => e.stopPropagation()}>
                {step === 1 && (<>
                    <div className="pm-header">
                        <h2 className="pm-title">Kursni sotib olish</h2>
                        <button className="pm-close" onClick={onClose}>✕</button>
                    </div>
                    <div className="pm-course-info">
                        <div className="pm-course-icon">📚</div>
                        <div>
                            <p className="pm-course-name">{course.title}</p>
                            <p className="pm-course-inst">👨‍🏫 {course.instructor_name}</p>
                        </div>
                    </div>
                    <div className="pm-price-row"><span>Narxi:</span><span className="pm-price">${course.price}</span></div>
                    <div className="pm-methods">
                        <p className="pm-methods-label">To'lov usuli</p>
                        <div className="pm-method-cards">
                            <div className="pm-method pm-method--active">💳 Bank kartasi</div>
                        </div>
                    </div>
                    <button className="pm-btn pm-btn--primary" onClick={() => setStep(2)}>Davom etish →</button>
                </>)}

                {step === 2 && (<>
                    <div className="pm-header">
                        <button className="pm-back-btn" onClick={() => setStep(1)}>← Orqaga</button>
                        <h2 className="pm-title">Karta ma'lumotlari</h2>
                        <button className="pm-close" onClick={onClose}>✕</button>
                    </div>
                    <div className="pm-card-preview">
                        <span className="pm-card-chip">💳</span>
                        <div className="pm-card-number-display">{cardData.number || '•••• •••• •••• ••••'}</div>
                        <div className="pm-card-bottom">
                            <div><p className="pm-card-label">Karta egasi</p><p className="pm-card-value">{cardData.name || 'ISM FAMILIYA'}</p></div>
                            <div><p className="pm-card-label">Muddati</p><p className="pm-card-value">{cardData.expiry || 'MM/YY'}</p></div>
                        </div>
                    </div>
                    <div className="pm-form">
                        <div className="pm-field">
                            <label>Karta raqami</label>
                            <input type="text" placeholder="0000 0000 0000 0000" value={cardData.number}
                                onChange={e => setCardData(p => ({ ...p, number: formatCard(e.target.value) }))} maxLength={19} />
                        </div>
                        <div className="pm-field">
                            <label>Karta egasi</label>
                            <input type="text" placeholder="Ism Familiya" value={cardData.name}
                                onChange={e => setCardData(p => ({ ...p, name: e.target.value.toUpperCase() }))} />
                        </div>
                        <div className="pm-field-row">
                            <div className="pm-field">
                                <label>Muddati</label>
                                <input type="text" placeholder="MM/YY" value={cardData.expiry}
                                    onChange={e => setCardData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
                            </div>
                            <div className="pm-field">
                                <label>CVV</label>
                                <input type="password" placeholder="•••" value={cardData.cvv}
                                    onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,3) }))} maxLength={3} />
                            </div>
                        </div>
                    </div>
                    {error && <p className="pm-error">{error}</p>}
                    <button className="pm-btn pm-btn--primary" onClick={handlePay} disabled={paying}>
                        {paying ? <><span className="pm-spinner"/>To'lanmoqda...</> : `💳 $${course.price} to'lash`}
                    </button>
                    <p className="pm-secure">🔒 Xavfsiz to'lov</p>
                </>)}

                {step === 3 && (
                    <div className="pm-success">
                        <div className="pm-success-icon">✅</div>
                        <h2>To'lov muvaffaqiyatli!</h2>
                        <p>Siz kursga muvaffaqiyatli yozildingiz.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Edit Lesson Modal ─────────────────────────────────────────────────────────
const EditLessonModal = ({ lesson, courseId, onClose, onSaved }) => {
    const [form, setForm] = useState({ title: lesson.title, content: lesson.content, order: lesson.order });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch(`courses/${courseId}/lessons/${lesson.id}/`, form);
            onSaved(res.data);
            onClose();
        } catch (err) {
            alert(err.response?.data?.detail || "Xatolik!");
        } finally { setSaving(false); }
    };

    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-modal" onClick={e => e.stopPropagation()}>
                <div className="pm-header">
                    <h2 className="pm-title">Darsni tahrirlash</h2>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSave} className="cd-lesson-form">
                    <div className="cd-form-row">
                        <div className="cd-field">
                            <label>Dars nomi</label>
                            <input type="text" value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                        </div>
                        <div className="cd-field">
                            <label>Tartib</label>
                            <input type="number" value={form.order}
                                onChange={e => setForm(p => ({ ...p, order: +e.target.value }))} min="0" />
                        </div>
                    </div>
                    <div className="cd-field">
                        <label>Kontent</label>
                        <textarea value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} required />
                    </div>
                    <div className="cd-form-actions">
                        <button type="button" className="cd-btn cd-btn--ghost" onClick={onClose}>Bekor</button>
                        <button type="submit" className="cd-btn cd-btn--primary" disabled={saving}>
                            {saving ? 'Saqlanmoqda...' : '✓ Saqlash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse]       = useState(null);
    const [lessons, setLessons]     = useState([]);
    const [reviews, setReviews]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [enrolled, setEnrolled]   = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [activeTab, setActiveTab] = useState('lessons');
    const [expandedLesson, setExpandedLesson] = useState(null); // ✅ expand/collapse
    const [editLesson, setEditLesson] = useState(null);          // ✅ edit modal

    // Lesson form
    const [lessonForm, setLessonForm]     = useState({ title: '', content: '', order: 0 });
    const [videoFile, setVideoFile]       = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [lessonLoading, setLessonLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showLessonForm, setShowLessonForm] = useState(false);

    // Review form
    const [reviewForm, setReviewForm]     = useState({ rating: 0, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);

    const token = localStorage.getItem('access');
    const user  = token ? jwtDecode(token) : null;
    const isInstructor = user?.role === 'instructor';
    const isOwner = user && course && String(course.instructor) === String(user.user_id);

    useEffect(() => {
        Promise.all([
            api.get(`courses/${id}/`),
            api.get(`courses/${id}/lessons/`),
            api.get(`courses/${id}/reviews/`),
        ])
        .then(([cR, lR, rR]) => {
            setCourse(cR.data);
            setLessons(toArray(lR.data));
            setReviews(toArray(rR.data));
        })
        .catch(console.error)
        .finally(() => setLoading(false));

        if (token) {
            api.get('my-courses/')
                .then(res => {
                    const data = toArray(res.data);
                    setEnrolled(data.some(e => String(e.course) === String(id)));
                })
                .catch(() => {});
        }
    }, [id]);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024 * 1024) { alert("Video 500MB dan kichik bo'lishi kerak!"); return; }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        setLessonLoading(true);
        setUploadProgress(0);
        try {
            const fd = new FormData();
            fd.append('title',   lessonForm.title);
            fd.append('content', lessonForm.content);
            fd.append('order',   lessonForm.order);
            if (videoFile) fd.append('video_file', videoFile);

            const res = await api.post(`courses/${id}/lessons/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: e => setUploadProgress(Math.round(e.loaded * 100 / e.total)),
            });
            setLessons(prev => [...prev, res.data]);
            setLessonForm({ title: '', content: '', order: 0 });
            setVideoFile(null); setVideoPreview('');
            setShowLessonForm(false); setUploadProgress(0);
        } catch (err) {
            alert(err.response?.data?.detail || "Dars qo'shishda xatolik!");
        } finally { setLessonLoading(false); }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Darsni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`courses/${id}/lessons/${lessonId}/`);
            setLessons(prev => prev.filter(l => l.id !== lessonId));
            if (expandedLesson === lessonId) setExpandedLesson(null);
        } catch { alert("O'chirishda xatolik!"); }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.rating) return alert("Iltimos, baho bering!");
        setReviewLoading(true);
        try {
            const res = await api.post(`courses/${id}/reviews/`, reviewForm);
            setReviews(prev => [...prev, res.data]);
            setReviewForm({ rating: 0, comment: '' });
        } catch (err) { alert(err.response?.data?.detail || "Xatolik!"); }
        finally { setReviewLoading(false); }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Reviewni o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`courses/${id}/reviews/${reviewId}/`);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch { alert("O'chirishda xatolik!"); }
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (loading) return <div className="cd-loading-screen"><div className="cd-spinner-lg" /></div>;
    if (!course)  return <div className="cd-loading-screen"><p style={{ color: '#64748b' }}>Kurs topilmadi.</p></div>;

    return (
        <div className="cd-wrapper">
            {showPayment && (
                <PaymentModal course={course} onClose={() => setShowPayment(false)} onSuccess={() => setEnrolled(true)} />
            )}
            {editLesson && (
                <EditLessonModal
                    lesson={editLesson}
                    courseId={id}
                    onClose={() => setEditLesson(null)}
                    onSaved={updated => setLessons(prev => prev.map(l => l.id === updated.id ? updated : l))}
                />
            )}

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
                                    enrolled
                                        ? <div className="cd-enrolled-badge">✅ Yozilgansiz</div>
                                        : <button className="cd-enroll-btn" onClick={() => token ? setShowPayment(true) : navigate('/login')}>
                                            🛒 Sotib olish
                                          </button>
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

                {/* ── Lesson add form ── */}
                {isOwner && showLessonForm && (
                    <div className="cd-panel">
                        <h2 className="cd-panel-title">Yangi dars qo'shish</h2>
                        <form onSubmit={handleAddLesson} className="cd-lesson-form">
                            <div className="cd-form-row">
                                <div className="cd-field">
                                    <label>Dars nomi</label>
                                    <input type="text" value={lessonForm.title}
                                        onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Masalan: Python asoslari" required />
                                </div>
                                <div className="cd-field">
                                    <label>Tartib</label>
                                    <input type="number" value={lessonForm.order}
                                        onChange={e => setLessonForm(p => ({ ...p, order: +e.target.value }))} min="0" />
                                </div>
                            </div>
                            <div className="cd-field">
                                <label>Kontent (matn yoki video link)</label>
                                <textarea value={lessonForm.content}
                                    onChange={e => setLessonForm(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Dars mazmuni yoki YouTube link..." rows={3} required />
                            </div>
                            <div className="cd-field">
                                <label>Video fayl (ixtiyoriy, max 500MB)</label>
                                <div className="cd-upload-area" onClick={() => document.getElementById('video-input').click()}>
                                    {videoPreview
                                        ? <video src={videoPreview} className="cd-video-preview" controls onClick={e => e.stopPropagation()} />
                                        : <div className="cd-upload-placeholder">
                                            <span className="cd-upload-icon">🎬</span>
                                            <p>Video yuklash uchun bosing</p>
                                            <p className="cd-upload-hint">MP4, WebM, MOV — max 500MB</p>
                                          </div>
                                    }
                                    <input id="video-input" type="file" accept="video/*" style={{ display:'none' }} onChange={handleVideoChange} />
                                </div>
                                {videoFile && (
                                    <div className="cd-file-info">
                                        🎬 {videoFile.name} — {(videoFile.size/1024/1024).toFixed(1)} MB
                                        <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(''); }}>✕</button>
                                    </div>
                                )}
                            </div>
                            {lessonLoading && uploadProgress > 0 && (
                                <div className="cd-progress">
                                    <div className="cd-progress-bar" style={{ width: `${uploadProgress}%` }} />
                                    <span>{uploadProgress}%</span>
                                </div>
                            )}
                            <div className="cd-form-actions">
                                <button type="button" className="cd-btn cd-btn--ghost" onClick={() => setShowLessonForm(false)}>Bekor</button>
                                <button type="submit" className="cd-btn cd-btn--primary" disabled={lessonLoading}>
                                    {lessonLoading ? `Yuklanmoqda ${uploadProgress}%...` : "+ Dars qo'shish"}
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

                {/* ── Lessons tab ── */}
                {activeTab === 'lessons' && (
                    <div className="cd-panel">
                        {lessons.length === 0
                            ? <div className="cd-empty"><span>📖</span><p>Hali darslar qo'shilmagan</p></div>
                            : <div className="cd-lesson-list">
                                {lessons.map((lesson, i) => (
                                    <div key={lesson.id} className={`cd-lesson-item ${expandedLesson === lesson.id ? 'cd-lesson-item--open' : ''}`}>
                                        {/* ✅ Header — bosish bilan expand */}
                                        <div className="cd-lesson-header" onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}>
                                            <span className="cd-lesson-num">{String(i + 1).padStart(2, '0')}</span>
                                            <div className="cd-lesson-info">
                                                <p className="cd-lesson-title">{lesson.title}</p>
                                                {expandedLesson !== lesson.id && (
                                                    <p className="cd-lesson-content">{lesson.content}</p>
                                                )}
                                            </div>
                                            <div className="cd-lesson-right">
                                                {lesson.video_file && <span className="cd-video-badge">🎬</span>}
                                                <span className={`cd-chevron ${expandedLesson === lesson.id ? 'cd-chevron--open' : ''}`}>›</span>
                                            </div>
                                        </div>

                                        {/* ✅ Expanded content */}
                                        {expandedLesson === lesson.id && (
                                            <div className="cd-lesson-body">
                                                <p className="cd-lesson-body-text">{lesson.content}</p>

                                                {lesson.video_file && (
                                                    <div className="cd-video-wrap">
                                                        <video
                                                            className="cd-lesson-video"
                                                            src={lesson.video_file}
                                                            controls
                                                            preload="metadata"
                                                        />
                                                    </div>
                                                )}

                                                {/* Owner uchun tugmalar */}
                                                {isOwner && (
                                                    <div className="cd-lesson-actions">
                                                        <button className="cd-lesson-btn cd-lesson-btn--edit"
                                                            onClick={e => { e.stopPropagation(); setEditLesson(lesson); }}>
                                                            ✏️ Tahrirlash
                                                        </button>
                                                        <button className="cd-lesson-btn cd-lesson-btn--delete"
                                                            onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}>
                                                            🗑 O'chirish
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                              </div>
                        }
                    </div>
                )}

                {/* ── Reviews tab ── */}
                {activeTab === 'reviews' && (
                    <div className="cd-panel">
                        {token && !isInstructor && (
                            <form onSubmit={handleAddReview} className="cd-review-form">
                                <h3 className="cd-review-form-title">Baho qoldiring</h3>
                                <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                                <textarea value={reviewForm.comment}
                                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                                    placeholder="Izoh qoldiring (ixtiyoriy)..." rows={3} />
                                <button type="submit" className="cd-btn cd-btn--primary" disabled={reviewLoading}>
                                    {reviewLoading ? 'Yuborilmoqda...' : 'Baho yuborish'}
                                </button>
                            </form>
                        )}
                        {reviews.length === 0
                            ? <div className="cd-empty"><span>⭐</span><p>Hali baholar yo'q</p></div>
                            : <div className="cd-review-list">
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
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;