/**
 * Convert any text to a URL-safe slug.
 * @param {string} text
 * @returns {string}
 */
export const toSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')      // spaces/underscores → dash
    .replace(/[^\w-]+/g, '')      // remove non-word chars
    .replace(/--+/g, '-')         // collapse multiple dashes
    .replace(/^-+|-+$/g, '');     // trim leading/trailing dashes
};

/**
 * Generate a unique slug by appending a numeric suffix if needed.
 * @param {string} text - Base text to slugify
 * @param {object} model - Prisma model (e.g. prisma.category)
 * @param {string} [field='slug'] - The field name to check
 * @param {string} [excludeId] - Exclude a specific record id from uniqueness check
 * @returns {Promise<string>}
 */
export const uniqueSlug = async (text, model, field = 'slug', excludeId = null) => {
  const base = toSlug(text);
  let slug = base;
  let counter = 1;

  while (true) {
    const where = { [field]: slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const existing = await model.findFirst({ where });
    if (!existing) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};
