import { prisma } from '@api/libs/prisma'
import { path } from 'ramda'

import { mapCollectionToOptions } from './mapCollectionToOptions'

export async function loadLeadsAsOptions() {
  const leads = await prisma.lead.findMany({
    include: {
      organization: true,
    },
    orderBy: {
      lastName: 'asc',
    },
  })

  return mapCollectionToOptions(leads, ['firstName', 'lastName'], 'id', path(['organization', 'name']) as () => string)
}
