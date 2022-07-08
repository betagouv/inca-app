import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'

import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/leads.js'

async function LeadsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterInclude = {
      contactCategory: true,
      organization: true,
      projects: true,
    }
    const filterOrderBy: any = {
      lastName: 'asc',
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const leads = await prisma.lead.findMany({
        include: filterInclude,
        orderBy: filterOrderBy,
      })

      res.status(200).json({
        data: leads,
      })

      return
    }

    const searchFilter = buildSearchFilter(['email', 'firstName', 'lastName', 'organization.name'], maybeQuery)
    const filteredLeads = await prisma.lead.findMany({
      include: filterInclude,
      orderBy: filterOrderBy,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredLeads,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withAuthentication(LeadsController, [Role.ADMINISTRATOR, Role.MANAGER])
