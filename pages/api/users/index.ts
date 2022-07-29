import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/users/index.js'

const mapExcludePassword = R.map(R.omit(['password']))

async function UserListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const filterOrderBy: any = {
          lastName: 'asc',
        }

        const users = await prisma.user.findMany({
          orderBy: filterOrderBy,
        })
        // TODO Replace programatically user password exclusion in API by a Prisma mechanism as soon as available.
        // Prisma field exclusion is still a feature request in progress:
        // https://github.com/prisma/prisma/issues/7380
        const usersWithoutPassword = mapExcludePassword(users)

        res.status(200).json({
          data: usersWithoutPassword,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    default:
      handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }
}

export default withAuthentication(UserListEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
