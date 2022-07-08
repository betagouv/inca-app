import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'

import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/prospects.js'

async function ProspectsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterInclude = {
      contactCategory: true,
    }
    const filterOrderBy: any = {
      lastName: 'asc',
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const prospects = await prisma.prospect.findMany({
        include: filterInclude,
        orderBy: filterOrderBy,
      })

      res.status(200).json({
        data: prospects,
      })

      return
    }

    const searchFilter = buildSearchFilter(['email', 'firstName', 'lastName', 'organization'], maybeQuery)
    const filteredProspects = await prisma.prospect.findMany({
      include: filterInclude,
      orderBy: filterOrderBy,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredProspects,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withAuthentication(ProspectsController, [Role.ADMINISTRATOR, Role.MANAGER])
