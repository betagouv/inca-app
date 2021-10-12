import bcrypt from 'bcryptjs'
import R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withPrisma from '../../../api/middlewares/withPrisma'

const ERROR_PATH = 'pages/api/auth/AuthSignupController()'
const BCRYPT_SALT_WORK_FACTOR = 10

async function AuthSignupController(req, res) {
  if (req.method !== 'POST') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const newUserData = R.pick(['email'], req.body)
    newUserData.password = await bcrypt.hash(req.body.password, BCRYPT_SALT_WORK_FACTOR)

    await req.db.user.create({
      data: newUserData,
    })

    res.status(201).json({})
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(AuthSignupController)
