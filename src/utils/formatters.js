/**
 * Formatea un número como moneda colombiana (COP)
 */
export const formatCOP = (amount) => {
  return '$ ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};