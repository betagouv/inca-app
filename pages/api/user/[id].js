import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'

const ERROR_PATH = 'pages/api/UserController()'

const excludePassword = R.omit(['password'])

async function UserController(req, res) {
  if (!['GET', 'PATCH'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeUser = await req.db.user.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeUser === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        // TODO Replace programatically user password exclusion in API by a Prisma mechanism as soon as available.
        // Prisma field exclusion is still a feature request in progress:
        // https://github.com/prisma/prisma/issues/7380
        const userWithoutPassword = excludePassword(maybeUser)

        res.status(200).json({
          data: userWithoutPassword,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeUser = await req.db.user.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeUser === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedUser = await req.db.user.update({
          data: req.body,
          where: {
            id: req.query.id,
          },
        })

        res.status(200).json({
          data: updatedUser,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withPrisma(withAuthentication(UserController))
