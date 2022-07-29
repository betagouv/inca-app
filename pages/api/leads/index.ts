import buildSearchFilter from '@api/helpers/buildSearchFilter'
import { getQueryFromRequest } from '@api/helpers/getQueryFromRequest'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/leads/index.js'

async function LeadListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const maybeQuery = getQueryFromRequest(req)

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
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newLeadData: any = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'organizationId', 'phone', 'position'],
          req.body,
        )
        const newLead = await prisma.lead.create({
          data: newLeadData,
        })

        res.status(201).json({
          data: newLead,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    default:
      handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }
}

export default withAuthentication(LeadListEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
