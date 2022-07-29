import buildSearchFilter from '@api/helpers/buildSearchFilter'
import { getQueryFromRequest } from '@api/helpers/getQueryFromRequest'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/prospects/index.js'

async function ProspectsController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const maybeQuery = getQueryFromRequest(req)

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
            hasError: false,
          })

          return
        }

        const searchFilter = buildSearchFilter(['email', 'firstName', 'lastName', 'organization'], maybeQuery)
        const foundProspects = await prisma.prospect.findMany({
          include: filterInclude,
          orderBy: filterOrderBy,
          ...searchFilter,
        })

        res.status(200).json({
          data: foundProspects,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newProspectData: any = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'organization', 'phone', 'position'],
          req.body,
        )
        const newProspect = await prisma.prospect.create({
          data: newProspectData,
        })

        res.status(201).json({
          data: newProspect,
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

export default withAuthentication(ProspectsController, [Role.ADMINISTRATOR, Role.MANAGER])
