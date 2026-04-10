// stores/useClientAuth.js
// Re-exporta useAuth con alias para compatibilidad con UserMenu.
// useAuth ya maneja tanto admin como clientes en un store unificado.
export { useAuth as useClientAuth } from './useAuth';
