const { PrismaClient } = require('@prisma/client')
const ß = require('bhala')

const seedContactCategories = require('./seeds/seedContactCategories')
const seedUsers = require('./seeds/seedUsers')

const prisma = new PrismaClient()

async function seed() {
  try {
    await seedUsers(prisma)
    await seedContactCategories(prisma)
  } catch (err) {
    ß.error(`[prisma/seed()] ${err}`, '❌')
  } finally {
    await prisma.$disconnect()
  }
}

seed()
