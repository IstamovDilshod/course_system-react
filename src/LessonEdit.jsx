import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .le-wrap {
    min-height: 100vh;
    background: #0d0f14;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 20px 80px;
    font-family: 'Sora', sans-serif;
  }

  .le-card {
    width: 100%;
    max-width: 620px;
    background: #13161e;
    border: 1px solid #1f2430;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 0 0 1px #1a1e28, 0 40px 80px rgba(0,0,0,0.5);
    animation: slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .le-header {
    padding: 28px 32px 24px;
    border-bottom: 1px solid #1a1e28;
    display: flex;
    align-items: center;
    gap: 14px;
    background: linear-gradient(135deg, #13161e 0%, #161a24 100%);
  }

  .le-header-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #5b6ef5, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(91,110,245,0.35);
  }

  .le-header h2 {
    font-size: 17px;
    font-weight: 600;
    color: #e8eaf0;
    letter-spacing: -0.01em;
  }

  .le-header p {
    font-size: 12px;
    color: #4a5068;
    margin-top: 2px;
    font-family: 'JetBrains Mono', monospace;
  }

  .le-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .le-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .le-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4a5068;
  }

  .le-input, .le-textarea {
    width: 100%;
    background: #0d0f14;
    border: 1.5px solid #1f2430;
    border-radius: 12px;
    padding: 13px 16px;
    color: #d8dae8;
    font-size: 14px;
    font-family: 'Sora', sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    resize: none;
  }

  .le-input::placeholder, .le-textarea::placeholder {
    color: #2e3348;
  }

  .le-input:focus, .le-textarea:focus {
    border-color: #5b6ef5;
    box-shadow: 0 0 0 3px rgba(91,110,245,0.12);
  }

  .le-textarea { line-height: 1.6; min-height: 110px; }

  /* Video zone */
  .le-video-zone {
    border-radius: 14px;
    overflow: hidden;
    border: 1.5px solid #1f2430;
    background: #0d0f14;
    position: relative;
  }

  .le-video-zone video {
    width: 100%;
    display: block;
    max-height: 280px;
    object-fit: cover;
  }

  .le-video-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(13,15,20,0.8);
    backdrop-filter: blur(8px);
    border: 1px solid #1f2430;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    color: #5b6ef5;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
  }

  /* Upload drop zone */
  .le-dropzone {
    border: 1.5px dashed #1f2430;
    border-radius: 14px;
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: #0d0f14;
    position: relative;
  }

  .le-dropzone:hover, .le-dropzone.drag-over {
    border-color: #5b6ef5;
    background: rgba(91,110,245,0.04);
  }

  .le-dropzone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .le-dropzone-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(91,110,245,0.15), rgba(139,92,246,0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .le-dropzone-text {
    font-size: 13px;
    color: #4a5068;
    text-align: center;
    line-height: 1.5;
  }

  .le-dropzone-text strong {
    color: #5b6ef5;
    font-weight: 600;
  }

  .le-dropzone-hint {
    font-size: 11px;
    color: #2e3348;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Footer / actions */
  .le-footer {
    padding: 20px 32px 28px;
    display: flex;
    gap: 12px;
  }

  .le-btn-save {
    flex: 1;
    padding: 14px 20px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #5b6ef5, #8b5cf6);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(91,110,245,0.3);
    letter-spacing: -0.01em;
  }

  .le-btn-save:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(91,110,245,0.45);
  }

  .le-btn-save:active:not(:disabled) { transform: translateY(0); }

  .le-btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .le-btn-cancel {
    padding: 14px 20px;
    border-radius: 12px;
    border: 1.5px solid #1f2430;
    background: transparent;
    color: #4a5068;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    white-space: nowrap;
  }

  .le-btn-cancel:hover {
    border-color: #e05c6a;
    color: #e05c6a;
    background: rgba(224,92,106,0.05);
  }

  /* Spinner */
  .le-spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  .le-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    padding: 13px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Sora', sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 999;
    animation: toastIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .le-toast.success {
    background: #111d17;
    border: 1px solid #22c55e;
    color: #4ade80;
  }

  .le-toast.error {
    background: #1d1112;
    border: 1px solid #e05c6a;
    color: #fb7185;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Skeleton loader */
  .le-skeleton {
    background: linear-gradient(90deg, #1a1e28 25%, #1f2430 50%, #1a1e28 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 10px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`le-toast ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
};

const LessonEdit = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", video: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`courses/${courseId}/lessons/${lessonId}/`);
      setForm({
        title: res.data.title || "",
        content: res.data.content || "",
        video: null,
      });
      setPreview(res.data.video || null);
    } catch {
      showToast("Darsni yuklashda xatolik", "error");
    } finally {
      setFetching(false);
    }
  };

  const showToast = (msg, type) => setToast({ msg, type });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const applyFile = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      showToast("Faqat video fayl yuklang", "error");
      return;
    }
    setForm((prev) => ({ ...prev, video: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => applyFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast("Dars nomi bo'sh bo'lishi mumkin emas", "error");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      if (form.video) formData.append("video", form.video);
      await api.put(`courses/${courseId}/lessons/${lessonId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Dars muvaffaqiyatli yangilandi", "success");
      setTimeout(() => navigate(-1), 1400);
    } catch {
      showToast("Saqlashda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="le-wrap">
        <div className="le-card">
          {/* Header */}
          <div className="le-header">
            <div className="le-header-icon">✏️</div>
            <div>
              <h2>Darsni tahrirlash</h2>
              <p>lesson #{lessonId} · course #{courseId}</p>
            </div>
          </div>

          {/* Body */}
          <div className="le-body">
            {/* Title */}
            <div className="le-field">
              <label className="le-label">Dars nomi</label>
              {fetching ? (
                <div className="le-skeleton" style={{ height: 46 }} />
              ) : (
                <input
                  className="le-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Masalan: HTML asoslari"
                  autoFocus
                />
              )}
            </div>

            {/* Content */}
            <div className="le-field">
              <label className="le-label">Dars matni yoki havola</label>
              {fetching ? (
                <div className="le-skeleton" style={{ height: 110 }} />
              ) : (
                <textarea
                  className="le-textarea"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Dars tavsifi yoki YouTube havolasi..."
                />
              )}
            </div>

            {/* Video */}
            <div className="le-field">
              <label className="le-label">Video</label>
              {preview && (
                <div className="le-video-zone" style={{ marginBottom: 12 }}>
                  <video controls key={preview}>
                    <source src={preview} />
                  </video>
                  <span className="le-video-badge">
                    {form.video ? "yangi video" : "mavjud video"}
                  </span>
                </div>
              )}
              <div
                className={`le-dropzone${dragOver ? " drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept="video/*" onChange={handleVideoChange} />
                <div className="le-dropzone-icon">🎬</div>
                <p className="le-dropzone-text">
                  <strong>Yuklash uchun bosing</strong> yoki shu yerga tashlang
                </p>
                <span className="le-dropzone-hint">MP4, MOV, AVI · maks 2 GB</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="le-footer">
            <button
              className="le-btn-save"
              onClick={handleSubmit}
              disabled={loading || fetching}
            >
              {loading ? (
                <>
                  <span className="le-spinner" />
                  Saqlanmoqda...
                </>
              ) : (
                <>💾 Saqlash</>
              )}
            </button>
            <button className="le-btn-cancel" onClick={() => navigate(-1)}>
              Bekor qilish
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default LessonEdit;