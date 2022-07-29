import buildSearchFilter from '@api/helpers/buildSearchFilter'
import { getQueryFromRequest } from '@api/helpers/getQueryFromRequest'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/contributors/index.js'

async function ContributorListController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const maybeQuery = getQueryFromRequest(req)

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

      return

    case 'POST':
      try {
        const newContributorData: any = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'phone'],
          req.body,
        )

        const newContributor = await prisma.contributor.create({
          data: newContributorData,
        })

        res.status(201).json({
          data: newContributor,
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

export default withAuthentication(ContributorListController, [Role.ADMINISTRATOR, Role.MANAGER])
