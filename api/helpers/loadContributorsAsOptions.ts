import { prisma } from '@api/libs/prisma'

import { mapCollectionToOptions } from './mapCollectionToOptions'

export async function loadContributorsAsOptions() {
  const contributors = await prisma.contributor.findMany({
    orderBy: {
      lastName: 'asc',
    },
  })

  return mapCollectionToOptions(contributors, ['firstName', 'lastName'], 'id')
}
