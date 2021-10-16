import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/OrganizationsController()'

async function OrganizationsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const projects = await req.db.project.findMany({
      include: {
        contributors: {
          include: {
            contributor: true,
          },
        },
        lead: true,
        organization: true,
        user: true,
      },
    })

    res.status(200).json({
      data: projects,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(OrganizationsController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
