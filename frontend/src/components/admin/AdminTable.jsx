// Tabla reutilizable para el CMS.
//
// Props:
//   columns — [{ key, label, width?, render? }]
//   rows    — array de datos
//   loading — boolean
//   onRowClick — (row) => void (opcional)

import styles from './AdminTable.module.css';

function Skeleton({ cols }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className={styles.skeletonRow}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className={styles.td}>
          <div className={styles.skeletonCell} style={{ width: j === 0 ? '60%' : '40%' }} />
        </td>
      ))}
    </tr>
  ));
}

export function AdminTable({ columns = [], rows = [], loading = false, onRowClick }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={styles.th}
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <Skeleton cols={columns.length} />
            : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length} className={styles.empty}>
                      No hay resultados
                    </td>
                  </tr>
                )
              : rows.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className={`${styles.tr} ${onRowClick ? styles.trClickable : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map(col => (
                      <td key={col.key} className={styles.td}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? '—'
                        }
                      </td>
                    ))}
                  </tr>
                ))
          }
        </tbody>
      </table>
    </div>
  );
}
