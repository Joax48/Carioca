/* ─────────────────────────────────────────
   BlogPostPage — Artículo individual
───────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { useParams }    from 'react-router-dom';
import { Navbar }       from '../components/layout/Navbar';
import { Footer }       from '../components/layout/Footer';
import { blogService }  from '../services';
import styles from './BlogPostPage.module.css';

export function BlogPostPage() {
  const { slug } = useParams();
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogService.getOne(slug)
      .then(setPost)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonContent}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonLine} style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  if (error || !post) return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Artículo no encontrado</h1>
          <a href="/blog" className={styles.backLink}>← Volver al blog</a>
        </div>
      </main>
      <Footer />
    </>
  );

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          {post.tags?.[0] && <span className={styles.tag}>{post.tags[0]}</span>}
          <h1 className={styles.title}>{post.title}</h1>
          {date && <p className={styles.date}>{date}</p>}
        </div>

        {/* ── Cover image ── */}
        {post.cover_url && (
          <div className={styles.coverWrap}>
            <img src={post.cover_url} alt={post.title} className={styles.cover} />
          </div>
        )}

        {/* ── Content ── */}
        <div className={styles.container}>
          <div className={styles.layout}>

            {/* Sidebar izquierda */}
            <aside className={styles.sidebar}>
              <a href="/blog" className={styles.backLink}>← Volver al blog</a>

              {post.tags?.length > 0 && (
                <div className={styles.tagsBlock}>
                  <p className={styles.tagsLabel}>Temas</p>
                  <div className={styles.tagsList}>
                    {post.tags.map(t => <span key={t} className={styles.tagPill}>{t}</span>)}
                  </div>
                </div>
              )}
            </aside>

            {/* Contenido principal */}
            <article className={styles.article}>
              {post.excerpt && (
                <p className={styles.excerpt}>{post.excerpt}</p>
              )}

              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
              />

              {/* Compartir */}
              <div className={styles.shareRow}>
                <span className={styles.shareLabel}>Compartir</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${window.location.href}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.instagram.com/`}
                  target="_blank" rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  Instagram
                </a>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
