import { PrismaClient } from '@prisma/client'
import { B } from 'bhala'

import seedUsers from './seeds/seedUsers.js'

const prisma = new PrismaClient()

async function seed() {
  try {
    await seedUsers(prisma)
  } catch (err) {
    B.error(`[prisma/seed()] ${err}`, '❌')
  } finally {
    await prisma.$disconnect()
  }
}

seed()
