// pages/admin/ProductsPage.jsx

import { useState, useEffect }    from "react";
import { AdminTable }             from "../../components/admin/AdminTable";
import { AdminModal }             from "../../components/admin/AdminModal";
import { AdminField, AdminInput, AdminTextarea, AdminSelect, AdminToggle }
  from "../../components/admin/AdminField";
import { ImageGalleryEditor }     from "../../components/admin/ImageGalleryEditor";
import { productsService, collectionsService, settingsService } from "../../services";
import styles from "./AdminPage.module.css";

function StatusBadge({ active }) {
  return (
    <span className={`${styles.badge} ${active ? styles.badgeActive : styles.badgeDraft}`}>
      {active ? "Activo" : "Borrador"}
    </span>
  );
}

function ColorDots({ variants = [] }) {
  if (!variants.length) return <span style={{ color: "var(--adm-text-3)" }}>—</span>;
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {variants.slice(0, 6).map(v => (
        <div key={v.id} title={v.color_name} style={{
          width: 14, height: 14, borderRadius: "50%",
          background: v.color_hex,
          border: "1px solid rgba(200,168,130,0.25)",
        }} />
      ))}
      {variants.length > 6 && (
        <span style={{ fontSize: 10, color: "var(--adm-text-3)", lineHeight: "14px" }}>
          +{variants.length - 6}
        </span>
      )}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--adm-gold)", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "var(--adm-border)" }} />
    </div>
  );
}

const COLUMNS = [
  {
    key: "images", label: "Imagen", width: 60,
    render: (imgs) => (
      <div className={styles.thumbCell}>
        {(imgs?.find(i => i.is_primary) ?? imgs?.[0])?.url
          ? <img src={(imgs.find(i => i.is_primary) ?? imgs[0]).url} alt="" className={styles.thumbImg} />
          : <div className={styles.thumbPlaceholder} />
        }
      </div>
    ),
  },
  { key: "name", label: "Nombre",
    render: (name, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {row.is_featured && (
          <span title="Producto destacado en el home" style={{ color: "var(--adm-gold)", fontSize: 11 }}>★</span>
        )}
        <span>{name}</span>
      </div>
    ),
  },
  { key: "collection", label: "Colección",
    render: (col) => col?.name ?? <span style={{ color: "var(--adm-text-3)" }}>—</span> },
  { key: "price", label: "Precio",
    render: (p) => p
      ? `₡${Number(p).toLocaleString()}`
      : <span style={{ color: "var(--adm-text-3)" }}>—</span> },
  { key: "variants", label: "Colores", render: (v) => <ColorDots variants={v} /> },
  { key: "is_active", label: "Estado", render: (val) => <StatusBadge active={val} /> },
  {
    key: "_actions", label: "", width: 96,
    render: (_, row, onEdit, onDelete, onFeature) => (
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          title={row.is_featured ? "Quitar del home" : "Mostrar en el home"}
          onClick={e => { e.stopPropagation(); onFeature(row); }}
          style={{ color: row.is_featured ? "var(--adm-gold)" : undefined }}
        >
          <IconStar filled={row.is_featured} />
        </button>
        <button className={styles.actionBtn}
          onClick={e => { e.stopPropagation(); onEdit(row); }}><IconEdit /></button>
        <button className={styles.actionBtn}
          onClick={e => { e.stopPropagation(); onDelete(row); }}><IconTrash /></button>
      </div>
    ),
  },
];

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const EMPTY_SIZES = () => Object.fromEntries(DEFAULT_SIZES.map(s => [s, 0]));

const EMPTY_FORM = {
  name: "", slug: "", description: "",
  price: "", compare_price: "", tag: "",
  collection_id: "", is_active: true,
};

export function ProductsPage() {
  const [products,     setProducts]     = useState([]);
  const [collections,  setCollections]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);
  const [imageItems,   setImageItems]   = useState([]);
  const [variants,     setVariants]     = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search,       setSearch]       = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([
        productsService.getAllAdmin({ limit: 200 }),
        collectionsService.getAllAdmin(),
      ]);
      setProducts(prods.data ?? []);
      setCollections(cols);
    } finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setErrors({});
    setImageItems([]); setVariants([]); setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name, slug: product.slug,
      description: product.description ?? "",
      price: product.price, compare_price: product.compare_price ?? "",
      tag: product.tag ?? "", collection_id: product.collection?.id ?? "",
      is_active: product.is_active,
    });
    setErrors({});
    setImageItems((product.images ?? []).map(img => ({
      id: img.id, url: img.url, preview: img.url,
      color_name: img.color_name ?? "", color_hex: img.color_hex ?? "",
      is_primary: img.is_primary ?? false,
    })));
    setVariants((product.variants ?? []).map(v => ({
      id: v.id, color_name: v.color_name, color_hex: v.color_hex,
      in_stock: v.in_stock, sizes: v.sizes ?? EMPTY_SIZES(),
    })));
    setModalOpen(true);
  }

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNameChange = (value) => setForm(f => ({
    ...f, name: value,
    slug: !editing
      ? value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : f.slug,
  }));

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es requerido";
    if (!form.slug.trim()) errs.slug = "El slug es requerido";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = "Ingresá un precio válido";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), slug: form.slug.trim(),
        description: form.description || undefined,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : undefined,
        tag: form.tag || undefined,
        collection_id: form.collection_id || undefined,
        is_active: form.is_active,
      };

      let productId;
      if (editing) {
        await productsService.update(editing.id, payload);
        productId = editing.id;
      } else {
        const created = await productsService.create(payload);
        productId = created.id;
      }

      // Subir imágenes nuevas (las que tienen .file)
      const newImgs = imageItems.filter(i => i.file);
      if (newImgs.length > 0) {
        const meta = newImgs.map((img) => ({
          alt_text: form.name,
          color_name: img.color_name || null,
          color_hex: img.color_hex || null,
          sort_order: imageItems.indexOf(img),
          is_primary: img.is_primary,
        }));
        await productsService.uploadImages(productId, newImgs.map(i => i.file), meta);
      }

      // Actualizar imágenes existentes modificadas
      for (const img of imageItems.filter(i => i.id)) {
        const orig = editing?.images?.find(o => o.id === img.id);
        if (orig && (orig.color_name !== img.color_name || orig.color_hex !== img.color_hex || orig.is_primary !== img.is_primary)) {
          await productsService.updateImage(img.id, {
            color_name: img.color_name || null,
            color_hex: img.color_hex || null,
            is_primary: img.is_primary,
          });
        }
      }

      // Eliminar imágenes removidas del editor
      for (const orig of (editing?.images ?? [])) {
        if (!imageItems.find(i => i.id === orig.id)) {
          await productsService.deleteImage(orig.id);
        }
      }

      // Crear variantes nuevas (sin id)
      for (const v of variants.filter(v => !v.id)) {
        await productsService.createVariant(productId, {
          color_name: v.color_name, color_hex: v.color_hex,
          in_stock: v.in_stock ?? true, sizes: v.sizes ?? {},
        });
      }
      // Actualizar variantes existentes (siempre — sizes puede haber cambiado)
      for (const v of variants.filter(v => v.id)) {
        await productsService.updateVariant(v.id, {
          color_name: v.color_name, color_hex: v.color_hex,
          in_stock: v.in_stock, sizes: v.sizes ?? {},
        });
      }
      // Eliminar variantes removidas
      for (const orig of (editing?.variants ?? [])) {
        if (!variants.find(v => v.id === orig.id)) {
          await productsService.deleteVariant(orig.id);
        }
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setErrors({ general: err.message ?? "Error al guardar" });
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await productsService.remove(deleteTarget.id); setDeleteTarget(null); await loadData(); }
    catch (err) { console.error(err); }
  }

  async function handleFeature(product) {
    try {
      if (product.is_featured) {
        // Ya está destacado → quitar
        await settingsService.clearFeatured(product.id);
      } else {
        // Limpiar el anterior destacado (si existe)
        const prev = products.find(p => p.is_featured);
        if (prev) await settingsService.clearFeatured(prev.id);
        await settingsService.setFeatured(product.id);
      }
      await loadData();
    } catch (err) { console.error(err); }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const columns  = COLUMNS.map(col =>
    col.key === "_actions"
      ? { ...col, render: (_, row) => col.render(_, row, openEdit, setDeleteTarget, handleFeature) }
      : col
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Productos</h2>
          <p className={styles.pageCount}>{products.length} en total</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <IconPlus /> Nuevo producto
        </button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <IconSearch />
          <input className={styles.searchInput} placeholder="Buscar producto..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <AdminTable columns={columns} rows={filtered} loading={loading} onRowClick={openEdit} />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? `Editar: ${editing.name}` : "Nuevo producto"}>
        <div className={styles.formStack}>
          {errors.general && <p className={styles.formError}>{errors.general}</p>}

          <SectionDivider label="Información básica" />
          <AdminField label="Nombre" error={errors.name} required>
            <AdminInput value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Legging Obsidiana" />
          </AdminField>
          <AdminField label="Slug" error={errors.slug} hint="Solo minúsculas, números y guiones">
            <AdminInput value={form.slug} onChange={e => setF("slug", e.target.value)} placeholder="legging-obsidiana" />
          </AdminField>
          <AdminField label="Descripción">
            <AdminTextarea value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Describe el producto..." rows={3} />
          </AdminField>
          <div className={styles.row2}>
            <AdminField label="Precio (₡)" error={errors.price} required>
              <AdminInput type="number" value={form.price} onChange={e => setF("price", e.target.value)} placeholder="18500" min="0" />
            </AdminField>
            <AdminField label="Precio comparar (₡)" hint="Precio tachado">
              <AdminInput type="number" value={form.compare_price} onChange={e => setF("compare_price", e.target.value)} placeholder="22000" min="0" />
            </AdminField>
          </div>
          <div className={styles.row2}>
            <AdminField label="Colección">
              <AdminSelect value={form.collection_id} onChange={e => setF("collection_id", e.target.value)}>
                <option value="">Sin colección</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </AdminSelect>
            </AdminField>
            <AdminField label="Tag" hint="Ej: Nuevo, Top">
              <AdminInput value={form.tag} onChange={e => setF("tag", e.target.value)} placeholder="Nuevo" maxLength={20} />
            </AdminField>
          </div>
          <AdminToggle label="Producto activo (visible en la tienda)"
            checked={form.is_active} onChange={val => setF("is_active", val)} />

          <SectionDivider label="Colores y stock por talla" />
          <p style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: -8 }}>
            Cada color tiene su propio inventario por talla. 0 = agotado en esa talla.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {variants.map((v, i) => {
              const updateV = (patch) =>
                setVariants(prev => prev.map((vv, idx) => idx === i ? { ...vv, ...patch } : vv));
              return (
                <div key={i} style={{
                  border: "0.5px solid var(--adm-border)", borderRadius: 6,
                  padding: "12px 12px 10px", background: "var(--adm-surface-2)",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {/* Header: nombre, color, toggle, borrar */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px auto 28px", gap: 8, alignItems: "center" }}>
                    <AdminInput
                      value={v.color_name}
                      onChange={e => updateV({ color_name: e.target.value })}
                      placeholder="Ej: Negro Obsidiana"
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="color" value={v.color_hex || "#C8A882"}
                        onChange={e => updateV({ color_hex: e.target.value })}
                        style={{ width: 28, height: 28, border: "0.5px solid var(--adm-border)",
                          borderRadius: 4, padding: 2, cursor: "pointer", background: "var(--adm-surface-2)" }} />
                      <span style={{ fontSize: 9, color: "var(--adm-text-3)", fontFamily: "monospace" }}>
                        {v.color_hex}
                      </span>
                    </div>
                    <AdminToggle checked={v.in_stock} label="Activo"
                      onChange={val => updateV({ in_stock: val })} />
                    <button type="button"
                      onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ width: 28, height: 28, display: "flex", alignItems: "center",
                        justifyContent: "center", background: "none",
                        border: "0.5px solid var(--adm-border)", borderRadius: 4,
                        color: "var(--adm-text-3)", cursor: "pointer" }}>
                      <IconTrash />
                    </button>
                  </div>

                  {/* Stock por talla para este color */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                    {DEFAULT_SIZES.map(size => (
                      <div key={size} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--adm-text-3)", textAlign: "center" }}>
                          {size}
                        </span>
                        <AdminInput
                          type="number" min="0"
                          value={v.sizes?.[size] ?? 0}
                          onChange={e => updateV({ sizes: { ...v.sizes, [size]: Number(e.target.value) } })}
                          style={{ textAlign: "center", padding: "4px 2px" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button type="button" className={styles.btnSecondary}
              onClick={() => setVariants(prev => [...prev, {
                color_name: "", color_hex: "#C8A882", in_stock: true, sizes: EMPTY_SIZES(),
              }])}
              style={{ alignSelf: "flex-start" }}>
              <IconPlus /> Agregar color
            </button>
          </div>

          <SectionDivider label="Imágenes del producto" />
          <p style={{ fontSize: 11, color: "var(--adm-text-3)", marginTop: -8 }}>
            Subí las fotos y asignales el color correspondiente. La ★ es la imagen del catálogo.
          </p>
          <ImageGalleryEditor images={imageItems} variants={variants} onChange={setImageItems} />

          <div className={styles.formActions}>
            <button className={styles.btnSecondary} onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </button>
            <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
              {saving ? <><span className={styles.miniSpinner} /> Guardando…</> : editing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </div>
      </AdminModal>

      {deleteTarget && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmTitle}>¿Eliminar producto?</p>
            <p className={styles.confirmSub}><strong>{deleteTarget.name}</strong> dejará de aparecer en la tienda.</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className={`${styles.btnPrimary} ${styles.btnDanger}`} onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const IconPlus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const IconEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2"/></svg>;
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const IconStar   = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
