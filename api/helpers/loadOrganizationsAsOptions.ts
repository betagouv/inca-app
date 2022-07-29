import { prisma } from '@api/libs/prisma'

import { mapCollectionToOptions } from './mapCollectionToOptions'

export async function loadOrganizationsAsOptions() {
  const organizations = await prisma.organization.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return mapCollectionToOptions(organizations, ['name'], 'id')
}
