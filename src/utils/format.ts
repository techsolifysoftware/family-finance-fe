/**
 * Formats a number or string into a currency string with thousand separators.
 * e.g. 1000000 -> "1.000.000"
 */
export const formatCurrencyInput = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return '';
  const numberValue = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString();
  if (!numberValue) return '';
  return new Intl.NumberFormat('vi-VN').format(parseInt(numberValue, 10));
};

/**
 * Parses a currency string back into a number.
 * e.g. "1.000.000" -> 1000000
 */
export const parseCurrencyInput = (value: string): number => {
  const numberString = value.replace(/\D/g, '');
  return numberString ? parseInt(numberString, 10) : 0;
};
