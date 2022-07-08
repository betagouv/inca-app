import bcrypt from 'bcryptjs'

const { FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD } = process.env
const BCRYPT_SALT_WORK_FACTOR = 10

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export default async function seedUsers(prisma) {
  if (!FIRST_ADMIN_EMAIL) {
    throw new Error('FIRST_ADMIN_EMAIL is not set')
  }
  if (!FIRST_ADMIN_PASSWORD) {
    throw new Error('FIRST_ADMIN_PASSWORD is not set')
  }

  const userCount = await prisma.user.count()

  if (userCount > 0) {
    return
  }

  const passwordHash = await bcrypt.hash(FIRST_ADMIN_PASSWORD, BCRYPT_SALT_WORK_FACTOR)

  await prisma.user.create({
    data: {
      email: FIRST_ADMIN_EMAIL,
      firstName: 'Admin',
      isActive: true,
      lastName: 'Admin',
      password: passwordHash,
      role: 'ADMINISTRATOR',
    },
  })
}
