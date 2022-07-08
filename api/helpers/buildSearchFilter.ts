import * as R from 'ramda'

const buildNativeStatements = (fields, searchQuery) =>
  R.pipe(
    R.reject(R.test(/\./)),
    R.map(nativeFields => ({
      [nativeFields]: {
        contains: searchQuery,
        mode: 'insensitive',
      },
    })),
  )(fields)

const buildRelationStatements = (fields, searchQuery) =>
  R.pipe(
    R.filter(R.test(/\./)),
    R.map(R.split('.')),
    R.map(([relationField, foreignField]) => ({
      [relationField]: {
        [foreignField]: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
    })),
  )(fields)

export default function buildSearchFilter(fields, searchQuery) {
  const nativeStatements = buildNativeStatements(fields, searchQuery)
  const relationStatements = buildRelationStatements(fields, searchQuery)

  return {
    where: {
      OR: [...nativeStatements, ...relationStatements],
    },
  }
}
