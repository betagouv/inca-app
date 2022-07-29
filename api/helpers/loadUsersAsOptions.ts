import { prisma } from '@api/libs/prisma'

import { mapCollectionToOptions } from './mapCollectionToOptions'

export async function loadUsersAsOptions() {
  const users = await prisma.user.findMany({
    orderBy: {
      lastName: 'asc',
    },
  })

  return mapCollectionToOptions(users, ['firstName', 'lastName'], 'id')
}
