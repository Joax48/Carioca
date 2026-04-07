// Gestión completa de productos: listar, crear, editar, eliminar.

import { useState, useEffect }    from 'react';
import { AdminTable }             from '../../components/admin/AdminTable';
import { AdminModal }             from '../../components/admin/AdminModal';
import { AdminField, AdminInput, AdminTextarea, AdminSelect, AdminToggle } from '../../components/admin/AdminField';
import { productsService }        from '../../services';
import { collectionsService }     from '../../services';
import { uploadProductImage }     from '../../services/supabase.client';
import styles from './AdminPage.module.css';

/* ── Status badge ── */
function StatusBadge({ active }) {
  return (
    <span className={`${styles.badge} ${active ? styles.badgeActive : styles.badgeDraft}`}>
      {active ? 'Activo' : 'Borrador'}
    </span>
  );
}

/* ── Columnas de la tabla ── */
const COLUMNS = [
  {
    key: 'images', label: 'Imagen', width: 64,
    render: (imgs, row) => (
      <div className={styles.thumbCell}>
        {imgs?.[0]?.url
          ? <img src={imgs[0].url} alt={row.name} className={styles.thumbImg} />
          : <div className={styles.thumbPlaceholder} />
        }
      </div>
    ),
  },
  { key: 'name',  label: 'Nombre' },
  {
    key: 'collection', label: 'Colección',
    render: (col) => col?.name ?? <span style={{ color: 'var(--adm-text-3)' }}>—</span>,
  },
  {
    key: 'price', label: 'Precio',
    render: (price) => `₡${Number(price).toLocaleString('es-CR')}`,
  },
  {
    key: 'tag', label: 'Tag',
    render: (tag) => tag
      ? <span className={styles.tagBadge}>{tag}</span>
      : <span style={{ color: 'var(--adm-text-3)' }}>—</span>,
  },
  {
    key: 'is_active', label: 'Estado',
    render: (val) => <StatusBadge active={val} />,
  },
  {
    key: '_actions', label: '',  width: 80,
    render: (_, row, onEdit, onDelete) => (
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={e => { e.stopPropagation(); onEdit(row); }}>
          <IconEdit />
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={e => { e.stopPropagation(); onDelete(row); }}>
          <IconTrash />
        </button>
      </div>
    ),
  },
];

/* ── Form vacío ── */
const EMPTY_FORM = {
  name: '', slug: '', description: '',
  price: '', compare_price: '', tag: '',
  collection_id: '', is_active: true,
};

export function ProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState(null);   // null = crear
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview,setImagePreview]= useState('');
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([
        productsService.getAll({ limit: 100 }),
        collectionsService.getAll(),
      ]);
      setProducts(prods.data ?? []);
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  }

  /* ── Abrir modal ── */
  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name:          product.name,
      slug:          product.slug,
      description:   product.description ?? '',
      price:         product.price,
      compare_price: product.compare_price ?? '',
      tag:           product.tag ?? '',
      collection_id: product.collection?.id ?? '',
      is_active:     product.is_active,
    });
    setErrors({});
    setImageFile(null);
    setImagePreview(product.images?.[0]?.url ?? '');
    setModalOpen(true);
  }

  /* ── Auto-slug desde nombre ── */
  const handleNameChange = (value) => {
    setForm(f => ({
      ...f,
      name: value,
      slug: !editing
        ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : f.slug,
    }));
  };

  /* ── Imagen preview ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ── Validar ── */
  function validate() {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'El nombre es requerido';
    if (!form.slug.trim())  errs.slug  = 'El slug es requerido';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = 'Ingresá un precio válido';
    return errs;
  }

  /* ── Guardar ── */
  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        slug:          form.slug.trim(),
        description:   form.description || undefined,
        price:         Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : undefined,
        tag:           form.tag || undefined,
        collection_id: form.collection_id || undefined,
        is_active:     form.is_active,
      };

      let saved;
      if (editing) {
        saved = await productsService.update(editing.id, payload);
      } else {
        saved = await productsService.create(payload);
      }

      // Subir imagen si hay una nueva
      if (imageFile && saved?.id) {
        const url = await uploadProductImage(imageFile, saved.id);
        await productsService.addImage(saved.id, { url, alt_text: form.name, sort_order: 0 });
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setErrors({ general: err.message ?? 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  }

  /* ── Eliminar ── */
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await productsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  /* ── Filtro de búsqueda ── */
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* Inyectar handlers en la columna de acciones */
  const columns = COLUMNS.map(col =>
    col.key === '_actions'
      ? { ...col, render: (_, row) => col.render(_, row, openEdit, setDeleteTarget) }
      : col
  );

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Productos</h2>
          <p className={styles.pageCount}>{products.length} en total</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <IconPlus /> Nuevo producto
        </button>
      </div>

      {/* ── Search ── */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <IconSearch />
          <input
            className={styles.searchInput}
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tabla ── */}
      <AdminTable
        columns={columns}
        rows={filtered}
        loading={loading}
        onRowClick={openEdit}
      />

      {/* ── Modal crear/editar ── */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar: ${editing.name}` : 'Nuevo producto'}
      >
        <ProductForm
          form={form}
          setForm={setForm}
          errors={errors}
          collections={collections}
          imagePreview={imagePreview}
          onNameChange={handleNameChange}
          onImageChange={handleImageChange}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          isEditing={!!editing}
        />
      </AdminModal>

      {/* ── Confirmar borrado ── */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ── ProductForm ── */
function ProductForm({ form, setForm, errors, collections, imagePreview,
  onNameChange, onImageChange, onSave, onCancel, saving, isEditing }) {

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className={styles.formStack}>

      {errors.general && (
        <p className={styles.formError}>{errors.general}</p>
      )}

      {/* Imagen */}
      <div className={styles.imageUpload}>
        <div className={styles.imagePreviewBox}>
          {imagePreview
            ? <img src={imagePreview} alt="Preview" className={styles.imagePreviewImg} />
            : <div className={styles.imagePreviewEmpty}>
                <IconImage />
                <span>Sin imagen</span>
              </div>
          }
        </div>
        <div className={styles.imageUploadActions}>
          <label className={styles.uploadBtn}>
            <IconUpload /> Subir imagen
            <input type="file" accept="image/*" onChange={onImageChange} hidden />
          </label>
          <p className={styles.uploadHint}>JPG, PNG o WebP · Máx 5 MB</p>
        </div>
      </div>

      <AdminField label="Nombre" error={errors.name} required>
        <AdminInput
          value={form.name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Legging Obsidiana"
        />
      </AdminField>

      <AdminField label="Slug (URL)" error={errors.slug}
        hint="Solo minúsculas, números y guiones">
        <AdminInput
          value={form.slug}
          onChange={e => f('slug', e.target.value)}
          placeholder="legging-obsidiana"
        />
      </AdminField>

      <AdminField label="Descripción">
        <AdminTextarea
          value={form.description}
          onChange={e => f('description', e.target.value)}
          placeholder="Descripción del producto..."
          rows={3}
        />
      </AdminField>

      <div className={styles.row2}>
        <AdminField label="Precio (₡)" error={errors.price} required>
          <AdminInput
            type="number"
            value={form.price}
            onChange={e => f('price', e.target.value)}
            placeholder="18500"
            min="0"
          />
        </AdminField>

        <AdminField label="Precio comparar (₡)" hint="Precio tachado opcional">
          <AdminInput
            type="number"
            value={form.compare_price}
            onChange={e => f('compare_price', e.target.value)}
            placeholder="22000"
            min="0"
          />
        </AdminField>
      </div>

      <div className={styles.row2}>
        <AdminField label="Colección">
          <AdminSelect
            value={form.collection_id}
            onChange={e => f('collection_id', e.target.value)}
          >
            <option value="">Sin colección</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </AdminSelect>
        </AdminField>

        <AdminField label="Tag" hint="Ej: Nuevo, Top, Oferta">
          <AdminInput
            value={form.tag}
            onChange={e => f('tag', e.target.value)}
            placeholder="Nuevo"
            maxLength={20}
          />
        </AdminField>
      </div>

      <AdminToggle
        label="Producto activo (visible en la tienda)"
        checked={form.is_active}
        onChange={val => f('is_active', val)}
      />

      {/* Botones */}
      <div className={styles.formActions}>
        <button className={styles.btnSecondary} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button className={styles.btnPrimary} onClick={onSave} disabled={saving}>
          {saving
            ? <><span className={styles.miniSpinner} /> Guardando…</>
            : isEditing ? 'Guardar cambios' : 'Crear producto'
          }
        </button>
      </div>
    </div>
  );
}

/* ── DeleteConfirm ── */
function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <div className={styles.confirmBackdrop}>
      <div className={styles.confirmBox}>
        <p className={styles.confirmTitle}>¿Eliminar producto?</p>
        <p className={styles.confirmSub}>
          <strong>{name}</strong> pasará a borrador y dejará de aparecer en la tienda.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
          <button className={`${styles.btnPrimary} ${styles.btnDanger}`} onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */
const IconPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const IconEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const IconImage  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
const IconUpload = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
