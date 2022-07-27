import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/user/[id].js'

const withoutPassword = R.omit(['password'])

async function UserController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)
        const maybeUser = await prisma.user.findUnique({
          where: {
            id,
          },
        })
        if (maybeUser === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        // TODO Replace programatically user password exclusion in API by a Prisma mechanism as soon as available.
        // Prisma field exclusion is still a feature request in progress:
        // https://github.com/prisma/prisma/issues/7380
        const userWithoutPassword = withoutPassword(maybeUser)

        res.status(200).json({
          data: userWithoutPassword,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)
        const maybeUser = await prisma.user.findUnique({
          where: {
            id,
          },
        })
        if (maybeUser === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedUserData = R.pick(['email', 'firstName', 'isActive', 'lastName', 'role'], req.body)
        await prisma.user.update({
          data: updatedUserData,
          where: {
            id,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    default:
      handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }
}

export default withAuthentication(UserController)
