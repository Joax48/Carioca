// Hook para obtener productos del backend.
// Maneja loading, error y refetch.

import { useState, useEffect, useCallback } from 'react';
import { productsService } from '../services';

/**
 * @param {object} filters — { collection, limit, offset, q }
 */
export function useProducts(filters = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Serializar filters para usar como dep del useEffect
  const filtersKey = JSON.stringify(filters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsService.getAll(JSON.parse(filtersKey));
      setData(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── Hook para un solo producto por slug ──────────────────
export function useProduct(slug) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsService.getOne(slug)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}
