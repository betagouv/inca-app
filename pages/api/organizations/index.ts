import buildSearchFilter from '@api/helpers/buildSearchFilter'
import { getQueryFromRequest } from '@api/helpers/getQueryFromRequest'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/organizations/index.js'

async function OrganizationListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const maybeQuery = getQueryFromRequest(req)

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
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newOrganizationdData: any = R.pick(['name', 'note'], req.body)
        const newOrganization = await prisma.organization.create({
          data: newOrganizationdData,
        })

        res.status(201).json({
          data: newOrganization,
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

export default withAuthentication(OrganizationListEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
