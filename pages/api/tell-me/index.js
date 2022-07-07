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

  const lastSynchronizations = await req.db.synchronization.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      createdAt: true,
      id: true,
      info: true,
      success: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    take: 5,
  })

  try {
    res.status(200).json({
      data: {
        lastSynchronizations,
        parameters: {
          apiUrl: process.env.TELL_ME_URL,
          contributorSurveyId: process.env.TELL_ME_CONTRIBUTOR_SURVEY_ID,
          defaultOrganizationId: process.env.TELL_ME_SYNCHRO_DEFAULT_ORGANIZATION_ID,
          defaultUserId: process.env.TELL_ME_SYNCHRO_DEFAULT_USER_ID,
          projectSurveyId: process.env.TELL_ME_PROJECT_SURVEY_ID,
          startDate: process.env.TELL_ME_SYNCHRO_START_DATE,
        },
      },
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(TellMeController, [USER_ROLE.ADMINISTRATOR]))
