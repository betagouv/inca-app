import dayjs from 'dayjs'
import R from 'ramda'

import getJwt from '../../../api/helpers/getJwt'
import handleError from '../../../api/helpers/handleError'
import isJwtExpired from '../../../api/helpers/isJwtExpired'
import ApiError from '../../../api/libs/ApiError'
import withPrisma from '../../../api/middlewares/withPrisma'

const ERROR_PATH = 'pages/api/auth/refresh.js'

async function AuthRefreshController(req, res) {
  if (req.method !== 'POST') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const tokenValue = String(req.body.token)

    const maybeToken = await req.db.refreshToken.findUnique({
      where: {
        value: tokenValue,
      },
    })
    if (maybeToken === null) {
      handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

      return
    }
    if (dayjs().isAfter(dayjs(maybeToken.expiredAt)) || (await isJwtExpired(tokenValue))) {
      await req.db.refreshToken.delete({
        where: {
          value: tokenValue,
        },
      })

      handleError(new ApiError(`Unauthorized.`, 401, true), ERROR_PATH, res)

      return
    }

    const { userId } = maybeToken
    const maybeUser = await req.db.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (maybeUser === null) {
      handleError(new ApiError(`Unauthorized.`, 401, true), ERROR_PATH, res)

      return
    }
    if (!maybeUser.isActive) {
      handleError(new ApiError('Forbidden.', 403, true), ERROR_PATH, res)

      return
    }

    const tokenPayload = R.pick(['email', 'firstName', 'id', 'lastName', 'role'], maybeUser)
    const sessionTokenValue = await getJwt(tokenPayload)
    if (sessionTokenValue === null) {
      handleError(new ApiError(`JWT generation failed.`, 500), ERROR_PATH, res)

      return
    }

    res.status(200).json({
      data: {
        sessionToken: sessionTokenValue,
      },
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(AuthRefreshController)
