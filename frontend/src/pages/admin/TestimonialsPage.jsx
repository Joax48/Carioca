// pages/admin/TestimonialsPage.jsx

import { useState, useEffect } from 'react';
import { AdminTable }          from '../../components/admin/AdminTable';
import { AdminModal }          from '../../components/admin/AdminModal';
import { testimonialsService } from '../../services';
import styles from './AdminPage.module.css';

/* ── Helpers ───────────────────────────────────── */
const fmtDate = dt => new Date(dt).toLocaleDateString('es-CR', {
  day: '2-digit', month: 'short', year: 'numeric',
});

function Stars({ count }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i < count ? 'var(--adm-gold)' : 'none'}
          stroke={i < count ? 'var(--adm-gold)' : 'var(--adm-border-2)'}
          strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function ApprovedBadge({ approved }) {
  return (
    <span className={styles.badge} style={
      approved
        ? { background: 'var(--adm-green-bg)', color: 'var(--adm-green)' }
        : { background: 'var(--adm-amber-bg)', color: 'var(--adm-amber)' }
    }>
      {approved ? 'Publicado' : 'Pendiente'}
    </span>
  );
}

/* ── Columnas ──────────────────────────────────── */
const COLUMNS = [
  {
    key: 'created_at', label: 'Fecha', width: 110,
    render: v => <span style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>{fmtDate(v)}</span>,
  },
  { key: 'author_name', label: 'Autor' },
  {
    key: 'stars', label: 'Calificación', width: 110,
    render: v => <Stars count={v} />,
  },
  {
    key: 'text', label: 'Reseña',
    render: v => (
      <span className={styles.descCell}>{v}</span>
    ),
  },
  {
    key: 'is_approved', label: 'Estado', width: 110,
    render: v => <ApprovedBadge approved={v} />,
  },
  {
    key: '_actions', label: '', width: 80,
    render: (_, row, onToggle) => (
      <div className={styles.actions} onClick={e => e.stopPropagation()}>
        <button
          className={styles.actionBtn}
          title={row.is_approved ? 'Ocultar' : 'Aprobar'}
          onClick={() => onToggle(row)}
        >
          {row.is_approved ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    ),
  },
];

/* ── Página principal ──────────────────────────── */
export function TestimonialsPage() {
  const [all,       setAll]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all'); // 'all' | 'pending' | 'approved'
  const [selected,  setSelected]  = useState(null);
  const [toggling,  setToggling]  = useState(null);  // id en proceso

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await testimonialsService.getAdmin();
      setAll(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(testimonial) {
    setToggling(testimonial.id);
    try {
      await testimonialsService.approve(testimonial.id, !testimonial.is_approved);
      setAll(prev => prev.map(t =>
        t.id === testimonial.id ? { ...t, is_approved: !t.is_approved } : t
      ));
      // Si el modal está abierto para este item, actualízalo
      if (selected?.id === testimonial.id) {
        setSelected(prev => ({ ...prev, is_approved: !prev.is_approved }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  }

  const filtered = all.filter(t => {
    if (filter === 'pending')  return !t.is_approved;
    if (filter === 'approved') return  t.is_approved;
    return true;
  });

  const pending  = all.filter(t => !t.is_approved).length;
  const approved = all.filter(t =>  t.is_approved).length;

  const columns = COLUMNS.map(col =>
    col.key === '_actions'
      ? { ...col, render: (_, row) => col.render(_, row, handleToggle) }
      : col
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Testimonios</h2>
          <p className={styles.pageCount}>
            {approved} publicado{approved !== 1 ? 's' : ''} · {pending} pendiente{pending !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { value: 'all',      label: 'Todos'       },
          { value: 'pending',  label: 'Pendientes'  },
          { value: 'approved', label: 'Publicados'  },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              fontFamily:   'var(--adm-font-body)',
              fontSize:     11,
              fontWeight:   filter === f.value ? 500 : 400,
              letterSpacing:'0.06em',
              padding:      '6px 14px',
              borderRadius: 999,
              cursor:       'pointer',
              border:       '0.5px solid',
              borderColor:  filter === f.value ? 'var(--adm-gold)' : 'var(--adm-border)',
              background:   filter === f.value ? 'var(--adm-gold-dim)' : 'transparent',
              color:        filter === f.value ? 'var(--adm-gold)' : 'var(--adm-text-3)',
              transition:   'all 150ms',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        rows={filtered}
        loading={loading}
        onRowClick={setSelected}
      />

      {/* Modal detalle */}
      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Reseña de ${selected.author_name}` : ''}
      >
        {selected && (
          <div className={styles.formStack}>

            {/* Estado + calificación */}
            <div style={{ display: 'flex', align: 'center', gap: 12, flexWrap: 'wrap' }}>
              <ApprovedBadge approved={selected.is_approved} />
              <Stars count={selected.stars} />
              <span style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>
                {fmtDate(selected.created_at)}
              </span>
            </div>

            {/* Autor */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--adm-text-3)', marginBottom: 4 }}>
                Autor
              </p>
              <p style={{ fontSize: 14, color: 'var(--adm-text)' }}>{selected.author_name}</p>
            </div>

            {/* Texto completo */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--adm-text-3)', marginBottom: 8 }}>
                Reseña
              </p>
              <p style={{
                fontSize: 14, color: 'var(--adm-text-2)', lineHeight: 1.7,
                padding: '14px 16px', background: 'var(--adm-surface-2)',
                border: '0.5px solid var(--adm-border)', borderRadius: 4,
                fontStyle: 'italic',
              }}>
                "{selected.text}"
              </p>
            </div>

            {/* Acción */}
            <div className={styles.formActions}>
              <button className={styles.btnSecondary} onClick={() => setSelected(null)}>
                Cerrar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => handleToggle(selected)}
                disabled={toggling === selected.id}
                style={selected.is_approved ? { background: 'var(--adm-red)', color: '#fff' } : {}}
              >
                {toggling === selected.id
                  ? <><span className={styles.miniSpinner} /> Guardando…</>
                  : selected.is_approved
                    ? 'Ocultar reseña'
                    : 'Publicar reseña'
                }
              </button>
            </div>

          </div>
        )}
      </AdminModal>
    </div>
  );
}

/* ── Íconos ────────────────────────────────────── */
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <path d="M1 1l22 22M14.12 14.12A3 3 0 019.88 9.88"/>
  </svg>
);
