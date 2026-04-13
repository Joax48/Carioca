/* ─────────────────────────────────────────
   BlogAdminPage — CMS para artículos del blog
───────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { blogService } from '../../services';
import styles from './BlogAdminPage.module.css';

const EMPTY_POST = { title: '', slug: '', excerpt: '', content: '', tags: '', cover_url: '', is_published: false };

export function BlogAdminPage() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing,  setEditing]  = useState(null); // null = lista, object = editor
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(false);
  const [error,   setError]   = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await blogService.getAllAdmin();
      setPosts(data ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openNew()  { setEditing({ ...EMPTY_POST }); setCoverFile(null); setCoverPreview(''); }
  function openEdit(p) {
    setEditing({ ...p, tags: (p.tags ?? []).join(', ') });
    setCoverFile(null);
    setCoverPreview(p.cover_url ?? '');
  }
  function closeEditor() { setEditing(null); setError(''); }

  function set(field) {
    return e => setEditing(prev => ({ ...prev, [field]: e.target.value }));
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function autoSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  async function handleSave() {
    if (!editing.title.trim()) { setError('El título es requerido'); return; }
    if (!editing.slug.trim())  { setError('El slug es requerido'); return; }
    setSaving(true); setError('');
    try {
      const body = {
        title:        editing.title,
        slug:         editing.slug,
        excerpt:      editing.excerpt,
        content:      editing.content,
        cover_url:    editing.cover_url || null,
        tags:         editing.tags ? editing.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        is_published: editing.is_published,
      };

      let saved;
      if (editing.id) {
        saved = await blogService.update(editing.id, body);
      } else {
        saved = await blogService.create(body);
      }

      // Subir imagen de portada si hay una nueva
      if (coverFile && saved.id) {
        const res = await blogService.uploadCover(saved.id, coverFile);
        saved.cover_url = res.url;
      }

      await load();
      closeEditor();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este artículo?')) return;
    try {
      await blogService.remove(id);
      await load();
    } catch (e) { setError(e.message); }
  }

  async function togglePublish(post) {
    try {
      await blogService.update(post.id, { is_published: !post.is_published });
      await load();
    } catch (e) { setError(e.message); }
  }

  /* ── Editor ── */
  if (editing !== null) return (
    <><div className={styles.editor}>
      <div className={styles.editorHeader}>
        <button className={styles.backBtn} onClick={closeEditor}>← Volver</button>
        <h2 className={styles.editorTitle}>{editing.id ? 'Editar artículo' : 'Nuevo artículo'}</h2>
        <div className={styles.editorActions}>
          <button
            type="button"
            className={`${styles.toggleRow} ${editing.is_published ? styles.toggleRowOn : ''}`}
            onClick={() => setEditing(prev => ({ ...prev, is_published: !prev.is_published }))}
          >
            <span className={styles.toggleTrack}>
              <span className={styles.toggleKnob} />
            </span>
            <span className={styles.toggleLabel}>
              {editing.is_published ? 'Publicado' : 'Borrador'}
            </span>
          </button>
          <button type="button" className={styles.previewBtn} onClick={() => setPreview(true)}>
            Previsualizar
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.editorBody}>
        {/* Columna principal */}
        <div className={styles.editorMain}>
          <div className={styles.field}>
            <label className={styles.label}>Título *</label>
            <input
              className={styles.input}
              value={editing.title}
              onChange={e => {
                const t = e.target.value;
                setEditing(prev => ({
                  ...prev,
                  title: t,
                  slug: prev.id ? prev.slug : autoSlug(t),
                }));
              }}
              placeholder="Título del artículo"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Extracto</label>
            <textarea
              className={styles.textarea}
              rows={2}
              value={editing.excerpt}
              onChange={set('excerpt')}
              placeholder="Resumen corto que aparece en la lista del blog..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contenido</label>
            <ContentEditor key={editing.id ?? 'new'} value={editing.content} onChange={v => setEditing(prev => ({ ...prev, content: v }))} />
          </div>
        </div>

        {/* Columna lateral */}
        <div className={styles.editorSide}>
          <div className={styles.sideCard}>
            <p className={styles.sideLabel}>Portada</p>
            <div className={styles.coverArea}>
              {coverPreview
                ? <img src={coverPreview} alt="Portada" className={styles.coverPreview} />
                : <div className={styles.coverPlaceholder}>Sin imagen</div>
              }
              <label className={styles.coverBtn}>
                <input type="file" accept="image/*" onChange={handleCoverChange} className={styles.fileInput} />
                {coverPreview ? 'Cambiar imagen' : 'Subir imagen'}
              </label>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.field}>
              <label className={styles.label}>Slug (URL) *</label>
              <input className={styles.input} value={editing.slug} onChange={set('slug')} placeholder="mi-articulo" />
              <p className={styles.hint}>carioca.cr/blog/{editing.slug || '...'}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tags</label>
              <input className={styles.input} value={editing.tags} onChange={set('tags')} placeholder="moda, atlética, tips" />
              <p className={styles.hint}>Separados por comas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {preview && <PreviewModal post={{
      ...editing,
      tags: editing.tags ? editing.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }} onClose={() => setPreview(false)} />}
    </>
  );

  /* ── Lista ── */
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Blog</h1>
          <p className={styles.pageCount}>{posts.length} artículo{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--adm-text-3)', textDecoration: 'none', padding: '8px 12px',
              border: '0.5px solid var(--adm-border)', borderRadius: 6, transition: 'color 150ms' }}
            onMouseEnter={e => e.target.style.color = 'var(--adm-gold)'}
            onMouseLeave={e => e.target.style.color = 'var(--adm-text-3)'}
          >
            Ver blog ↗
          </a>
          <button className={styles.newBtn} onClick={openNew}>+ Nuevo artículo</button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay artículos todavía.</p>
          <button className={styles.newBtn} onClick={openNew}>Crear el primero</button>
        </div>
      ) : (
        <div className={styles.postList}>
          {posts.map(post => (
            <div key={post.id} className={styles.postRow}>
              {post.cover_url && (
                <img src={post.cover_url} alt={post.title} className={styles.postThumb} />
              )}
              <div className={styles.postInfo}>
                <div className={styles.postMeta}>
                  <span className={`${styles.statusBadge} ${post.is_published ? styles.statusPublished : styles.statusDraft}`}>
                    {post.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                  {post.published_at && (
                    <span className={styles.postDate}>
                      {new Date(post.published_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className={styles.postTitle}>{post.title}</p>
                {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
                {post.tags?.length > 0 && (
                  <div className={styles.tagRow}>
                    {post.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}
              </div>
              <div className={styles.postActions}>
                <button className={styles.actionBtnPrimary} onClick={() => openEdit(post)}>
                  Editar
                </button>
                <button
                  className={`${styles.actionBtn} ${post.is_published ? styles.actionBtnDanger : styles.actionBtnSuccess}`}
                  onClick={() => togglePublish(post)}
                  title={post.is_published ? 'Quitar de publicado' : 'Publicar ahora'}
                >
                  {post.is_published ? 'Despublicar' : 'Publicar'}
                </button>
                {post.is_published
                  ? <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="Ver en el sitio">Ver ↗</a>
                  : null
                }
                <button className={`${styles.actionIconBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(post.id)} title="Eliminar artículo">
                  <IconTrashSm />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Preview modal ── */
function PreviewModal({ post, onClose }) {
  return (
    <div className={styles.previewBackdrop} onClick={onClose}>
      <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
        <div className={styles.previewHeader}>
          <span className={styles.previewBadge}>Vista previa — borrador</span>
          <button className={styles.previewClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.previewBody}>
          {post.tags?.[0] && <span className={styles.previewTag}>{post.tags[0]}</span>}
          <h1 className={styles.previewTitle}>{post.title || 'Sin título'}</h1>
          {post.excerpt && <p className={styles.previewExcerpt}>{post.excerpt}</p>}
          {post.cover_url && (
            <img src={post.cover_url} alt="" className={styles.previewCover} />
          )}
          <div
            className={styles.previewContent}
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Rich text editor ── */
function ContentEditor({ value, onChange }) {
  const ref         = useRef(null);
  const fileRef     = useRef(null);
  const savedRange  = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? '';
    }
  }, []); // solo en mount

  function exec(cmd, val = null) {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML ?? '');
  }

  // Guarda la posición del cursor antes de abrir el file picker
  function handleImageClick() {
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
    fileRef.current?.click();
  }

  const handleImageFile = useCallback(async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => blogService.uploadImage(f).then(r => r.url)));
      // Restaura selección
      ref.current?.focus();
      if (savedRange.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
      let html;
      if (urls.length === 1) {
        html = `<img src="${urls[0]}" alt="" style="max-width:100%;border-radius:6px;margin:12px 0;display:block;" />`;
      } else {
        const imgs = urls.map(u =>
          `<img src="${u}" alt="" style="width:100%;height:220px;object-fit:cover;border-radius:6px;display:block;" />`
        ).join('');
        html = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0;">${imgs}</div>`;
      }
      document.execCommand('insertHTML', false, html);
      onChange(ref.current?.innerHTML ?? '');
    } catch (err) {
      console.error('Error subiendo imágenes:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [onChange]);

  return (
    <div className={styles.richEditor}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2'); }} title="Título H2">H2</button>
        <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3'); }} title="Subtítulo H3">H3</button>
        <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p'); }} title="Párrafo">¶</button>
        <div className={styles.toolSep} />
        <button type="button" className={`${styles.toolBtn} ${styles.toolBold}`} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Negrita">B</button>
        <button type="button" className={`${styles.toolBtn} ${styles.toolItalic}`} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Cursiva">I</button>
        <div className={styles.toolSep} />
        <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} title="Lista">•</button>
        <button type="button" className={styles.toolBtn} onMouseDown={e => {
          e.preventDefault();
          const url = prompt('URL del enlace:');
          if (url) exec('createLink', url);
        }} title="Insertar enlace">⌘K</button>
        <div className={styles.toolSep} />
        <button
          type="button"
          className={`${styles.toolBtn} ${styles.toolImgBtn}`}
          onMouseDown={e => { e.preventDefault(); handleImageClick(); }}
          title="Insertar imagen"
          disabled={uploading}
        >
          {uploading ? <span className={styles.toolSpinner} /> : <IconImg />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.fileInput}
          onChange={handleImageFile}
        />
      </div>
      <div
        ref={ref}
        className={styles.richContent}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
      />
    </div>
  );
}

const IconImg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

const IconTrashSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2"/>
  </svg>
);
