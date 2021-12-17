import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/projects.js'

async function OrganizationsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterInclude = {
      contributors: {
        include: {
          contributor: true,
        },
      },
      lead: true,
      organization: true,
      user: true,
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const projects = await req.db.project.findMany({
        include: filterInclude,
      })

      res.status(200).json({
        data: projects,
      })

      return
    }

    const searchFilter = buildSearchFilter(['name'], maybeQuery)
    const filteredProjects = await req.db.project.findMany({
      include: filterInclude,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredProjects,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(OrganizationsController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
