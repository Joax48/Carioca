/* ─────────────────────────────────────────
   BlogPage — Listado público del blog
───────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { blogService } from '../services';
import styles from './BlogPage.module.css';

function useBlogPosts() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    blogService.getAll({ limit: 20 })
      .then(res => setData(res.data ?? []))
      .catch(e  => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function BlogPage() {
  const { data: posts, loading, error } = useBlogPosts();
  const [activeTag, setActiveTag] = useState(null);

  const allTags = [...new Set(posts.flatMap(p => p.tags ?? []))];
  const filtered = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts;

  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <p className={styles.heroLabel}>Carioca Journal</p>
          <h1 className={styles.heroTitle}>Notas & Estilo</h1>
          <p className={styles.heroSub}>
            Moda atlética, tips de cuidado, inspiración y todo lo que pasa en Carioca.
          </p>
        </div>

        <div className={styles.container}>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className={styles.tags}>
              <button
                className={`${styles.tagBtn} ${!activeTag ? styles.tagActive : ''}`}
                onClick={() => setActiveTag(null)}
              >
                Todo
              </button>
              {allTags.map(t => (
                <button
                  key={t}
                  className={`${styles.tagBtn} ${activeTag === t ? styles.tagActive : ''}`}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
            </div>
          ) : error ? (
            <p className={styles.errorMsg}>No se pudieron cargar los artículos.</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>No hay artículos publicados aún.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((post, i) => (
                <PostCard key={post.id} post={post} featured={i === 0 && filtered.length > 2 && !activeTag} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PostCard({ post, featured }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className={`${styles.card} ${featured ? styles.cardFeatured : ''}`}>
      <a href={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={styles.cardImg}>
          {post.cover_url
            ? <img src={post.cover_url} alt={post.title} className={styles.img} />
            : <div className={styles.imgFallback} />
          }
          {post.tags?.[0] && (
            <span className={styles.cardTag}>{post.tags[0]}</span>
          )}
        </div>
        <div className={styles.cardBody}>
          {date && <p className={styles.cardDate}>{date}</p>}
          <h2 className={styles.cardTitle}>{post.title}</h2>
          {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
          <span className={styles.cardRead}>Leer más →</span>
        </div>
      </a>
    </article>
  );
}

function PostSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonLine} style={{ width: '40%' }} />
      <div className={styles.skeletonLine} style={{ width: '80%', height: 20 }} />
      <div className={styles.skeletonLine} style={{ width: '65%' }} />
    </div>
  );
}
