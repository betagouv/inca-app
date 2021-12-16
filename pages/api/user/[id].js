import bcrypt from 'bcryptjs'
import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'

const BCRYPT_SALT_WORK_FACTOR = 10
const ERROR_PATH = 'pages/api/user/[id].js'

const excludePassword = R.omit(['password'])

async function UserController(req, res) {
  if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
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

    case 'POST':
      try {
        const newUserData = R.pick(['email', 'firstName', 'isActive', 'lastName', 'role'], req.body)
        newUserData.password = await bcrypt.hash(req.body.password, BCRYPT_SALT_WORK_FACTOR)

        await req.db.user.create({
          data: newUserData,
        })

        res.status(201).json({})
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

        const updatedUserData = R.pick(['email', 'firstName', 'isActive', 'lastName', 'role'], req.body)
        if (req.body.password !== undefined) {
          updatedUserData.password = await bcrypt.hash(req.body.password, BCRYPT_SALT_WORK_FACTOR)
        }
        await req.db.user.update({
          data: updatedUserData,
          where: {
            id: req.query.id,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withPrisma(withAuthentication(UserController))
