/**
 * Normalizes text by removing accents and non-alphanumeric characters
 * This is useful for generating clean prefixes for use in IDs
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';

  // Handle special characters that might not be properly caught by normalize
  const specialCharsMap: Record<string, string> = {
    Ê: 'E',
    ê: 'e',
    Ë: 'E',
    ë: 'e',
    É: 'E',
    é: 'e',
    È: 'E',
    è: 'e',
    Á: 'A',
    á: 'a',
    À: 'A',
    à: 'a',
    Ã: 'A',
    ã: 'a',
    Â: 'A',
    â: 'a',
    Ä: 'A',
    ä: 'a',
    Í: 'I',
    í: 'i',
    Ì: 'I',
    ì: 'i',
    Î: 'I',
    î: 'i',
    Ï: 'I',
    ï: 'i',
    Ó: 'O',
    ó: 'o',
    Ò: 'O',
    ò: 'o',
    Õ: 'O',
    õ: 'o',
    Ô: 'O',
    ô: 'o',
    Ö: 'O',
    ö: 'o',
    Ú: 'U',
    ú: 'u',
    Ù: 'U',
    ù: 'u',
    Û: 'U',
    û: 'u',
    Ü: 'U',
    ü: 'u',
    Ç: 'C',
    ç: 'c',
    Ñ: 'N',
    ñ: 'n',
    '.': '',
    ' ': '',
    '-': '',
    _: '',
    '/': '',
    '\\': '',
    ',': '',
    ';': '',
    ':': '',
    '!': '',
    '?': '',
    '@': '',
    '#': '',
    $: '',
    '%': '',
    '&': '',
    '*': '',
    '(': '',
    ')': '',
    '[': '',
    ']': '',
    '{': '',
    '}': '',
    '<': '',
    '>': '',
    '=': '',
    '+': '',
    '|': '',
    '`': '',
    '~': '',
    '^': '',
    '"': '',
    "'": '',
  };

  // First replace direct mappings for special characters
  let result = text;
  for (const [char, replacement] of Object.entries(specialCharsMap)) {
    result = result.split(char).join(replacement);
  }

  // Then apply standard normalization for any remaining accents
  return result
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '') // Remove remaining accents
    .replaceAll(/[^a-zA-Z0-9]/g, ''); // Remove any remaining non-alphanumeric characters
};

/**
 * Generates a default prefix from a name
 * @param name The name to generate a prefix from
 * @param length The number of characters to use for the prefix
 * @returns The generated prefix in uppercase
 */
export const generateDefaultPrefix = (name: string, length: number): string => {
  return normalizeText(name).slice(0, length).toUpperCase();
};
