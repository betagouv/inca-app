import getJwtPayload from './getJwtPayload'
import handleError from './handleError'

/**
 * Check JWT expiration
 */
export default async function isJwtExpired(token) {
  try {
    const maybePayload = await getJwtPayload(token)

    if (maybePayload === null) {
      return true
    }

    return false
  } catch (err) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      return true
    }

    handleError(err, 'api/helpers/isJwtExpired()')

    return true
  }
}
