import type { NextApiRequest } from 'next'

export function getQueryFromRequest(req: NextApiRequest): string | undefined | never {
  const { query } = req.query
  if (query !== undefined && typeof query !== 'string') {
    throw new Error('Query `id` is not a string.')
  }

  return query
}
