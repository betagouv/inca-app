import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'

import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/organizations.js'

async function OrganizationsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterOrderBy: any = {
      name: 'asc',
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const organizations = await prisma.organization.findMany({
        orderBy: filterOrderBy,
      })

      res.status(200).json({
        data: organizations,
      })

      return
    }

    const searchFilter = buildSearchFilter(['name'], maybeQuery)
    const filteredOrganizations = await prisma.organization.findMany({
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

export default withAuthentication(OrganizationsController, [Role.ADMINISTRATOR, Role.MANAGER])
