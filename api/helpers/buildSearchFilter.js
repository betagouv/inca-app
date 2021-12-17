import * as R from 'ramda'

const buildInclude = R.pipe(
  R.map(R.split('.')),
  R.map(([releationField]) => [releationField, true]),
  R.fromPairs,
)

const buildNativeStatements = (nativeFields, searchQuery) =>
  R.map(nativeFields => ({
    [nativeFields]: {
      contains: searchQuery,
      mode: 'insensitive',
    },
  }))(nativeFields)

const buildRelationStatements = (relationFields, searchQuery) =>
  R.pipe(
    R.map(R.split('.')),
    R.map(([relationField, foreignField]) => ({
      [relationField]: {
        [foreignField]: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
    })),
  )(relationFields)

const filterRelationFields = R.filter(R.test(/\./))
const rejectRelationFields = R.reject(R.test(/\./))

export default function buildSearchFilter(fields, searchQuery) {
  const nativeFields = rejectRelationFields(fields)
  const relationFields = filterRelationFields(fields)

  const nativeStatements = buildNativeStatements(nativeFields, searchQuery)
  const relationStatements = buildRelationStatements(relationFields, searchQuery)

  const filter = {
    where: {
      OR: [...nativeStatements, ...relationStatements],
    },
  }

  if (relationFields.length === 0) {
    return filter
  }

  filter.include = buildInclude(relationFields)

  return filter
}
