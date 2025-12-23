/**
 * Utilidad reutilizable para paginación en cualquier endpoint
 * @param {Object} req - Request de Express
 * @param {Object} Model - Modelo de Mongoose
 * @param {Object} query - Filtros de búsqueda (opcional)
 * @returns {Object} - Resultado paginado
 */
export async function paginate(req, Model, query = {}) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const total = await Model.countDocuments(query);
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * limit;

  const items = await Model.find(query).skip(skip).limit(limit).lean();

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    items,
  };
}
