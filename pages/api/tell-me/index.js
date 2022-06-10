import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/tell-me/index.js'

async function TellMeController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    res.status(200).json({
      data: {
        apiUrl: process.env.TELL_ME_URL,
        contributorId: process.env.TELL_ME_CONTRIBUTOR_SURVEY_ID,
        projectId: process.env.TELL_ME_PROJECT_SURVEY_ID,
      },
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(TellMeController, [USER_ROLE.ADMINISTRATOR]))
