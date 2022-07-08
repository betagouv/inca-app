import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'

import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/contributors.js'

async function ContributorsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterInclude = {
      contactCategory: true,
      projects: {
        include: {
          project: true,
        },
      },
    }
    const filterOrderBy: any = {
      lastName: 'asc',
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const contributors = await prisma.contributor.findMany({
        include: filterInclude,
        orderBy: filterOrderBy,
      })

      res.status(200).json({
        data: contributors,
      })

      return
    }

    const searchFilter = buildSearchFilter(['email', 'firstName', 'lastName'], maybeQuery)
    const filteredContributors = await prisma.contributor.findMany({
      include: filterInclude,
      orderBy: filterOrderBy,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredContributors,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withAuthentication(ContributorsController, [Role.ADMINISTRATOR, Role.MANAGER])
