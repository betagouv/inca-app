import bcrypt from 'bcryptjs'
import R from 'ramda'

import getJwt from '../../../api/helpers/getJwt'
import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withPrisma from '../../../api/middlewares/withPrisma'

const ERROR_PATH = 'pages/api/auth/login.js'

async function AuthLoginController(req, res) {
  if (req.method !== 'POST') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const maybeUser = await req.db.user.findUnique({
      where: {
        email: req.body.email,
      },
    })
    if (maybeUser === null) {
      handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

      return
    }

    const matchPassword = await bcrypt.compare(req.body.password, maybeUser.password)
    if (!matchPassword) {
      handleError(new ApiError('Unauthorized.', 401, true), ERROR_PATH, res)

      return
    }

    if (!maybeUser.isActive) {
      handleError(new ApiError('Forbidden.', 403, true), ERROR_PATH, res)

      return
    }

    const maybeIp = req.headers['x-real-ip']
    const tokenPayload = R.pick(['id', 'email', 'role'], maybeUser)
    const sessionToken = await getJwt(tokenPayload)

    // If we can't resolve the client IP for the authenticated user,
    // let's skip the Refresh JWT step
    if (maybeIp === undefined) {
      res.status(200).json({
        data: {
          sessionToken,
        },
      })

      return
    }

    // Delete all existing Refresh JWT for the authenticated user client
    await req.db.token.deleteMany({
      where: {
        email: maybeUser.email,
        ip: maybeIp,
      },
    })

    const refreshToken = await getJwt(tokenPayload, maybeIp)

    // Save the new Refresh JWT for the authenticated user client
    const newTokenData = {
      email: maybeUser.email,
      ip: maybeIp,
      value: refreshToken,
    }
    await req.db.token.create({
      data: newTokenData,
    })

    res.status(200).json({
      data: {
        refreshToken,
        sessionToken,
      },
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(AuthLoginController)
