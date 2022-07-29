import type { NextApiRequest, GetServerSidePropsContext } from 'next'
import type { NextRouter } from 'next/router'

export function getIdFromRequest(req: GetServerSidePropsContext | NextRouter | NextApiRequest): string | never {
  const { id } = req.query
  if (typeof id !== 'string') {
    throw new Error('Query `id` is not a string.')
  }

  return id
}
