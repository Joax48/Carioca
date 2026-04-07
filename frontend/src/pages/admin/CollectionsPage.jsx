// Gestión completa de colecciones.

import { useState, useEffect }    from 'react';
import { AdminTable }             from '../../components/admin/AdminTable';
import { AdminModal }             from '../../components/admin/AdminModal';
import { AdminField, AdminInput, AdminTextarea, AdminToggle } from '../../components/admin/AdminField';
import { collectionsService }     from '../../services';
import { uploadProductImage }     from '../../services/supabase.client';
import styles from './AdminPage.module.css';

const COLUMNS = [
  {
    key: 'image_url', label: 'Imagen', width: 64,
    render: (url, row) => (
      <div className={styles.thumbCell}>
        {url
          ? <img src={url} alt={row.name} className={styles.thumbImg} />
          : <div className={styles.thumbPlaceholder} />
        }
      </div>
    ),
  },
  { key: 'name',  label: 'Nombre' },
  { key: 'slug',  label: 'Slug' },
  {
    key: 'description', label: 'Descripción',
    render: (desc) => desc
      ? <span className={styles.descCell}>{desc}</span>
      : <span style={{ color: 'var(--adm-text-3)' }}>—</span>,
  },
  {
    key: 'is_active', label: 'Estado',
    render: (val) => (
      <span className={`${styles.badge} ${val ? styles.badgeActive : styles.badgeDraft}`}>
        {val ? 'Activa' : 'Oculta'}
      </span>
    ),
  },
  {
    key: '_actions', label: '', width: 80,
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

const EMPTY_FORM = { name: '', slug: '', description: '', is_active: true };

export function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview,setImagePreview]= useState('');
  const [deleteTarget,setDeleteTarget]= useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Usar service_key en backend para traer también las inactivas
      const data = await collectionsService.getAll();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  }

  function openEdit(col) {
    setEditing(col);
    setForm({
      name:        col.name,
      slug:        col.slug,
      description: col.description ?? '',
      is_active:   col.is_active,
    });
    setErrors({});
    setImageFile(null);
    setImagePreview(col.image_url ?? '');
    setModalOpen(true);
  }

  const handleNameChange = (value) => {
    setForm(f => ({
      ...f,
      name: value,
      slug: !editing
        ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : f.slug,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
    if (!form.slug.trim()) errs.slug = 'El slug es requerido';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      // Si hay imagen nueva, subirla primero
      let imageUrl = editing?.image_url;
      if (imageFile) {
        const id = editing?.id ?? crypto.randomUUID();
        imageUrl = await uploadProductImage(imageFile, `collections/${id}`);
      }

      const payload = {
        name:        form.name.trim(),
        slug:        form.slug.trim(),
        description: form.description || undefined,
        image_url:   imageUrl,
        is_active:   form.is_active,
      };

      if (editing) {
        await collectionsService.update(editing.id, payload);
      } else {
        await collectionsService.create(payload);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setErrors({ general: err.message ?? 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await collectionsService.update(deleteTarget.id, { is_active: false });
      setDeleteTarget(null);
      await loadData();
    } catch (err) { console.error(err); }
  }

  const columns = COLUMNS.map(col =>
    col.key === '_actions'
      ? { ...col, render: (_, row) => col.render(_, row, openEdit, setDeleteTarget) }
      : col
  );

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Colecciones</h2>
          <p className={styles.pageCount}>{collections.length} en total</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <IconPlus /> Nueva colección
        </button>
      </div>

      <AdminTable
        columns={columns}
        rows={collections}
        loading={loading}
        onRowClick={openEdit}
      />

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar: ${editing.name}` : 'Nueva colección'}
      >
        <CollectionForm
          form={form}
          setForm={setForm}
          errors={errors}
          imagePreview={imagePreview}
          onNameChange={handleNameChange}
          onImageChange={handleImageChange}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          isEditing={!!editing}
        />
      </AdminModal>

      {deleteTarget && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmTitle}>¿Ocultar colección?</p>
            <p className={styles.confirmSub}>
              <strong>{deleteTarget.name}</strong> dejará de aparecer en la tienda,
              pero sus productos no se eliminarán.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className={`${styles.btnPrimary} ${styles.btnDanger}`} onClick={handleDelete}>
                Ocultar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CollectionForm ── */
function CollectionForm({ form, setForm, errors, imagePreview,
  onNameChange, onImageChange, onSave, onCancel, saving, isEditing }) {
  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className={styles.formStack}>
      {errors.general && <p className={styles.formError}>{errors.general}</p>}

      {/* Imagen de portada */}
      <div className={styles.imageUpload}>
        <div className={`${styles.imagePreviewBox} ${styles.imagePreviewWide}`}>
          {imagePreview
            ? <img src={imagePreview} alt="Preview" className={styles.imagePreviewImg} />
            : <div className={styles.imagePreviewEmpty}>
                <IconImage />
                <span>Imagen de portada</span>
              </div>
          }
        </div>
        <div className={styles.imageUploadActions}>
          <label className={styles.uploadBtn}>
            <IconUpload /> Subir imagen
            <input type="file" accept="image/*" onChange={onImageChange} hidden />
          </label>
          <p className={styles.uploadHint}>Recomendado: 1600 × 900 px (16:9)</p>
        </div>
      </div>

      <AdminField label="Nombre" error={errors.name} required>
        <AdminInput
          value={form.name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Colección Verano"
        />
      </AdminField>

      <AdminField label="Slug (URL)" error={errors.slug}
        hint="Solo minúsculas, números y guiones">
        <AdminInput
          value={form.slug}
          onChange={e => f('slug', e.target.value)}
          placeholder="verano"
        />
      </AdminField>

      <AdminField label="Descripción" hint="Aparece en la página de la colección">
        <AdminTextarea
          value={form.description}
          onChange={e => f('description', e.target.value)}
          placeholder="Prendas ligeras y coloridas para el verano..."
          rows={3}
        />
      </AdminField>

      <AdminToggle
        label="Colección activa (visible en la tienda)"
        checked={form.is_active}
        onChange={val => f('is_active', val)}
      />

      <div className={styles.formActions}>
        <button className={styles.btnSecondary} onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button className={styles.btnPrimary} onClick={onSave} disabled={saving}>
          {saving
            ? <><span className={styles.miniSpinner} /> Guardando…</>
            : isEditing ? 'Guardar cambios' : 'Crear colección'
          }
        </button>
      </div>
    </div>
  );
}

/* ── Icons ── */
const IconPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const IconEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconImage  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
const IconUpload = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
