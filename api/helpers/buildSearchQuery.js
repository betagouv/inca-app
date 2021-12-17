export default function buildSearchQuery(fields, searchQuery) {
  return fields.map(field => ({
    [field]: {
      contains: searchQuery,
      mode: 'insensitive',
    },
  }))
}
