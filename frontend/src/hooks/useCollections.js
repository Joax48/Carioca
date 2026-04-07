
import { useState, useEffect } from 'react';
import { collectionsService, testimonialsService } from '../services';

export function useCollections() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    collectionsService.getAll()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ── Colección individual por slug ────────────────────────
export function useCollection(slug) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    collectionsService.getOne(slug)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}

// ── Testimonios aprobados ────────────────────────────────
export function useTestimonials() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    testimonialsService.getAll()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
