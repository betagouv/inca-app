export default function buildSearchFilter(fields, searchQuery) {
  const orStatements = fields.map(field => ({
    [field]: {
      contains: searchQuery,
      mode: 'insensitive',
    },
  }))

  return {
    where: {
      OR: orStatements,
    },
  }
}
