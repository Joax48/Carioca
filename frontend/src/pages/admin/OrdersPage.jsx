// pages/admin/OrdersPage.jsx

import { useState, useEffect } from 'react';
import { AdminTable }          from '../../components/admin/AdminTable';
import { AdminModal }          from '../../components/admin/AdminModal';
import { AdminField, AdminTextarea, AdminSelect }
  from '../../components/admin/AdminField';
import { ordersService }       from '../../services';
import styles from './AdminPage.module.css';

/* ── Constantes ────────────────────────────────── */
const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  bg: 'var(--adm-amber-bg)',              color: 'var(--adm-amber)' },
  confirmed: { label: 'Confirmado', bg: 'var(--adm-blue-bg)',               color: 'var(--adm-blue)'  },
  shipped:   { label: 'Enviado',    bg: 'rgba(107, 191, 201, 0.12)',        color: '#6BBFC9'          },
  completed: { label: 'Completado', bg: 'var(--adm-green-bg)',              color: 'var(--adm-green)' },
  cancelled: { label: 'Cancelado',  bg: 'rgba(200, 168, 130, 0.08)',        color: 'var(--adm-text-3)'},
};

const STATUS_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped',   'cancelled'],
  shipped:   ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_FILTERS = [
  { value: '',          label: 'Todos'      },
  { value: 'pending',   label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados'},
  { value: 'shipped',   label: 'Enviados'   },
  { value: 'completed', label: 'Completados'},
  { value: 'cancelled', label: 'Cancelados' },
];

const fmt      = n  => `₡${Number(n).toLocaleString('es-CR')}`;
const fmtDate  = dt => new Date(dt).toLocaleDateString('es-CR', {
  day: '2-digit', month: 'short', year: 'numeric',
});
const fmtShort = id => id?.slice(-8).toUpperCase() ?? '—';

/* ── Sub-componentes ───────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'transparent', color: 'inherit' };
  return (
    <span className={styles.badge} style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

/* ── Columnas de la tabla ──────────────────────── */
const COLUMNS = [
  {
    key: 'created_at', label: 'Fecha', width: 110,
    render: v => <span style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>{fmtDate(v)}</span>,
  },
  {
    key: 'id', label: 'Pedido', width: 100,
    render: v => (
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--adm-text-3)' }}>
        #{fmtShort(v)}
      </span>
    ),
  },
  { key: 'customer_name',  label: 'Cliente' },
  {
    key: 'customer_email', label: 'Correo',
    render: v => <span style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>{v}</span>,
  },
  { key: 'city', label: 'Ciudad', width: 120 },
  {
    key: 'total', label: 'Total', width: 120,
    render: v => (
      <span style={{ fontFamily: 'var(--adm-font-display)', fontSize: 14, color: 'var(--adm-text)' }}>
        {fmt(v)}
      </span>
    ),
  },
  {
    key: 'status', label: 'Estado', width: 120,
    render: v => <StatusBadge status={v} />,
  },
];

/* ── Página principal ──────────────────────────── */
export function OrdersPage() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [statusFilter,setStatusFilter]= useState('');
  const [selected,    setSelected]    = useState(null);  // pedido abierto en el modal
  const [detail,      setDetail]      = useState(null);  // datos completos del pedido
  const [detailLoad,  setDetailLoad]  = useState(false);
  const [newStatus,   setNewStatus]   = useState('');
  const [adminNotes,  setAdminNotes]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saveErr,     setSaveErr]     = useState('');

  useEffect(() => { loadOrders(); }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data   = await ordersService.getAll(params);
      setOrders(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(order) {
    setSelected(order);
    setDetail(null);
    setDetailLoad(true);
    setNewStatus('');
    setAdminNotes('');
    setSaveErr('');
    try {
      const full = await ordersService.getOne(order.id);
      setDetail(full);
      setAdminNotes(full.admin_notes ?? '');
    } finally {
      setDetailLoad(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
  }

  async function handleStatusUpdate() {
    if (!newStatus || !detail) return;
    setSaving(true);
    setSaveErr('');
    try {
      await ordersService.updateStatus(detail.id, {
        status:      newStatus,
        admin_notes: adminNotes || undefined,
      });
      closeDetail();
      await loadOrders();
    } catch (err) {
      setSaveErr(err?.message ?? 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  const transitions = STATUS_TRANSITIONS[detail?.status ?? 'pending'] ?? [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Pedidos</h2>
          <p className={styles.pageCount}>{orders.length} resultado{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros de estado */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            style={{
              fontFamily:   'var(--adm-font-body)',
              fontSize:     11,
              fontWeight:   statusFilter === f.value ? 500 : 400,
              letterSpacing:'0.06em',
              padding:      '6px 14px',
              borderRadius: 999,
              cursor:       'pointer',
              border:       '0.5px solid',
              borderColor:  statusFilter === f.value ? 'var(--adm-gold)' : 'var(--adm-border)',
              background:   statusFilter === f.value ? 'var(--adm-gold-dim)' : 'transparent',
              color:        statusFilter === f.value ? 'var(--adm-gold)' : 'var(--adm-text-3)',
              transition:   'all 150ms',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <AdminTable
        columns={COLUMNS}
        rows={orders}
        loading={loading}
        onRowClick={openDetail}
      />

      {/* Modal de detalle */}
      <AdminModal
        open={!!selected}
        onClose={closeDetail}
        title={selected ? `Pedido #${fmtShort(selected.id)}` : ''}
      >
        {detailLoad || !detail ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <span className={styles.miniSpinner} style={{ width: 20, height: 20 }} />
          </div>
        ) : (
          <div className={styles.formStack}>

            {/* Estado actual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusBadge status={detail.status} />
              <span style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>
                Creado {fmtDate(detail.created_at)}
              </span>
            </div>

            <SectionDivider label="Cliente" />

            <InfoGrid rows={[
              ['Nombre',  detail.customer_name],
              ['Correo',  detail.customer_email],
              ['Teléfono',detail.customer_phone],
            ]} />

            <SectionDivider label="Envío" />

            <InfoGrid rows={[
              ['Método', detail.delivery_method === 'pickup' ? 'Retiro en tienda' : 'Mensajería privada'],
              ...(detail.delivery_method !== 'pickup' ? [
                ['Dirección', detail.shipping_address],
                ['Ciudad',    detail.city],
              ] : []),
            ]} />

            {detail.notes && (
              <InfoGrid rows={[['Notas del cliente', detail.notes]]} />
            )}

            <SectionDivider label="Productos" />

            {/* Items del pedido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(detail.items ?? []).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '10px 12px', background: 'var(--adm-surface-2)',
                  border: '0.5px solid var(--adm-border)', borderRadius: 4, gap: 12,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 13, color: 'var(--adm-text)', fontWeight: 500 }}>
                      {item.product_name}
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {item.color && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 999,
                          background: 'var(--adm-gold-dim)', color: 'var(--adm-gold)',
                          fontWeight: 500, letterSpacing: '0.05em',
                        }}>
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 999,
                          background: 'var(--adm-surface-3)', color: 'var(--adm-text-2)',
                          fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                          Talla {item.size}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>
                        {fmt(item.product_price)} × {item.quantity} ud.
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--adm-font-display)', fontSize: 14,
                    color: 'var(--adm-text)', whiteSpace: 'nowrap', paddingTop: 2,
                  }}>
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Resumen financiero */}
            <div style={{
              background: 'var(--adm-surface-2)', border: '0.5px solid var(--adm-border)',
              borderRadius: 4, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <TotalRow label="Subtotal"  value={fmt(detail.subtotal)} />
              {detail.discount_amount > 0 && (
                <TotalRow
                  label={`Descuento (${detail.discount_percentage}%)`}
                  value={`−${fmt(detail.discount_amount)}`}
                  color="var(--adm-green)"
                />
              )}
              <TotalRow
                label="Envío"
                value={
                  detail.delivery_method === 'pickup'
                    ? 'Retiro en tienda · Gratis'
                    : detail.shipping_cost > 0
                      ? fmt(detail.shipping_cost)
                      : 'Por coordinar'
                }
                dimValue={!detail.shipping_cost && detail.delivery_method !== 'pickup'}
              />
              <div style={{ height: '0.5px', background: 'var(--adm-border)', margin: '4px 0' }} />
              <TotalRow label="Total" value={fmt(detail.total)} bold />
            </div>

            {/* SINPE */}
            {detail.sinpe_phone && (
              <>
                <SectionDivider label="SINPE" />
                <InfoGrid rows={[
                  ['Teléfono SINPE', detail.sinpe_phone],
                  ['Confirmado',     detail.sinpe_confirmed_at ? fmtDate(detail.sinpe_confirmed_at) : 'No'],
                ]} />
              </>
            )}

            {/* Notas de admin */}
            {detail.admin_notes && !transitions.length && (
              <>
                <SectionDivider label="Notas admin" />
                <p style={{ fontSize: 12, color: 'var(--adm-text-2)', lineHeight: 1.6 }}>
                  {detail.admin_notes}
                </p>
              </>
            )}

            {/* Actualizar estado */}
            {transitions.length > 0 && (
              <>
                <SectionDivider label="Actualizar estado" />

                <AdminField label="Nuevo estado">
                  <AdminSelect value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="">— Sin cambio —</option>
                    {transitions.map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                    ))}
                  </AdminSelect>
                </AdminField>

                <AdminField label="Notas internas (opcional)" hint="Solo visibles para el equipo">
                  <AdminTextarea
                    rows={3}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Ej: Pagó a las 2pm, transferencia #12345…"
                  />
                </AdminField>

                {saveErr && <p className={styles.formError}>{saveErr}</p>}

                <div className={styles.formActions}>
                  <button className={styles.btnSecondary} onClick={closeDetail} disabled={saving}>
                    Cancelar
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleStatusUpdate}
                    disabled={saving || !newStatus}
                  >
                    {saving
                      ? <><span className={styles.miniSpinner} /> Guardando…</>
                      : 'Guardar cambio'
                    }
                  </button>
                </div>
              </>
            )}

            {/* Estado terminal */}
            {!transitions.length && (
              <div style={{
                padding: '12px 14px', background: 'var(--adm-surface-2)',
                border: '0.5px solid var(--adm-border)', borderRadius: 4,
                fontSize: 12, color: 'var(--adm-text-3)', textAlign: 'center',
              }}>
                Este pedido está en estado final y no puede modificarse.
              </div>
            )}

          </div>
        )}
      </AdminModal>
    </div>
  );
}

/* ── Helpers internos ──────────────────────────── */
function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
      <span style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--adm-gold)', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--adm-border)' }} />
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--adm-text-3)' }}>
            {label}
          </span>
          <span style={{ fontSize: 13, color: 'var(--adm-text-2)', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {value ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

function TotalRow({ label, value, bold, color, dimValue }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: bold ? 13 : 12, fontWeight: bold ? 500 : 400, color: 'var(--adm-text-2)' }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 15 : 13,
        fontFamily: bold ? 'var(--adm-font-display)' : undefined,
        fontWeight: bold ? 400 : undefined,
        color: color ?? (dimValue ? 'var(--adm-text-3)' : bold ? 'var(--adm-text)' : 'var(--adm-text-2)'),
      }}>
        {value}
      </span>
    </div>
  );
}
