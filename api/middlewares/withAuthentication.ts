import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import { getUser } from 'nexauth'

import handleError from '../helpers/handleError'
import ApiError from '../libs/ApiError'

const ERROR_PATH = 'middlewares/withAuthentication()'

export default function withAuthentication(
  handler: (...args: any[]) => Promise<any>,
  allowedRoles: Role[] = [Role.ADMINISTRATOR],
) {
  return async (req, res) => {
    try {
      const jwtUser = await getUser(req)
      if (jwtUser === undefined) {
        throw new ApiError(`Unauthorized.`, 401, true)
      }

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          isActive: true,
          role: true,
        },
        where: {
          id: jwtUser.id,
        },
      })
      if (user === null || !user.isActive) {
        throw new ApiError(`Unauthorized.`, 401, true)
      }
      if (!allowedRoles.includes(user.role)) {
        throw new ApiError(`Forbidden.`, 403, true)
      }

      const reqWithAuth = Object.assign(req, {
        me: {
          id: user.id,
        },
      })

      return await handler(reqWithAuth, res)
    } catch (err) {
      return handleError(err, ERROR_PATH, res)
    }
  }
}
