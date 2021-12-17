import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/organizations.js'

async function OrganizationsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterOrderBy = {
      name: 'asc',
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const organizations = await req.db.organization.findMany({
        orderBy: filterOrderBy,
      })

      res.status(200).json({
        data: organizations,
      })

      return
    }

    const searchFilter = buildSearchFilter(['name'], maybeQuery)
    const filteredOrganizations = await req.db.organization.findMany({
      orderBy: filterOrderBy,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredOrganizations,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(OrganizationsController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
