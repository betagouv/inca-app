import { PrismaClient } from '@prisma/client'
import { B } from 'bhala'

import seedContactCategories from './seeds/seedContactCategories'
import seedUsers from './seeds/seedUsers'

const prisma = new PrismaClient()

async function seed() {
  try {
    await seedUsers(prisma)
    await seedContactCategories(prisma)
  } catch (err) {
    B.error(`[prisma/seed()] ${err}`, '❌')
  } finally {
    await prisma.$disconnect()
  }
}

seed()
