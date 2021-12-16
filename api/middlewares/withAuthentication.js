import { USER_ROLE } from '../../common/constants'
import getJwtPayload from '../helpers/getJwtPayload'
import handleError from '../helpers/handleError'
import ApiError from '../libs/ApiError'

const ERROR_PATH = 'middlewares/withAuthentication()'

export default function withAuthentication(handler, allowedRoles = [USER_ROLE.ADMINISTRATOR]) {
  return async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization

      if (authorizationHeader === undefined || !/^Bearer .+$/.test(authorizationHeader)) {
        return handleError(new ApiError(`Unauthorized.`, 401, true), ERROR_PATH, res)
      }

      const sessionToken = /^Bearer (.+)$/.exec(authorizationHeader)[1]
      const maybeTokenPayload = await getJwtPayload(sessionToken)
      if (maybeTokenPayload === null) {
        return handleError(new ApiError(`Unauthorized.`, 401, true), ERROR_PATH, res)
      }

      const userId = maybeTokenPayload.id
      const maybeUser = await req.db.user.findUnique({
        where: {
          id: userId,
        },
      })
      if (maybeUser === null || !maybeUser.isActive) {
        return handleError(new ApiError(`Unauthorized.`, 401, true), ERROR_PATH, res)
      }

      if (!allowedRoles.includes(maybeUser.role)) {
        return handleError(new ApiError(`Forbidden.`, 403, true), ERROR_PATH, res)
      }

      const reqWithAuth = Object.assign(req, {
        me: {
          id: userId,
        },
      })

      return await handler(reqWithAuth, res)
    } catch (err) {
      return handleError(err, ERROR_PATH, res)
    }
  }
}
