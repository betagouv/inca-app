import * as R from 'ramda'

import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/users.js'

const withoutPassword = R.map(R.omit(['password']))

async function UsersController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const filterOrderBy = {
      lastName: 'asc',
    }

    const users = await req.db.user.findMany({
      orderBy: filterOrderBy,
    })
    // TODO Replace programatically user password exclusion in API by a Prisma mechanism as soon as available.
    // Prisma field exclusion is still a feature request in progress:
    // https://github.com/prisma/prisma/issues/7380
    const usersWithoutPassword = withoutPassword(users)

    res.status(200).json({
      data: usersWithoutPassword,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(UsersController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
