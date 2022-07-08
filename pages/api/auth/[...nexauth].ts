import { prisma } from '@api/libs/prisma'
import { User, Role } from '@prisma/client'
import { Nexauth, PrismaAdapter } from 'nexauth'

export default Nexauth<User>({
  adapter: new PrismaAdapter({
    prismaInstance: prisma,
  }),
  config: {
    accessTokenPublicUserProps: ['email', 'firstName', 'id', 'lastName', 'role'],
    firstUserDefaultProps: {
      isActive: true,
      role: Role.ADMINISTRATOR,
    },
    logInConditions: [user => user.isActive],
    newUserAllowedProps: ['email', 'firstName', 'lastName', 'password'],
  },
})
