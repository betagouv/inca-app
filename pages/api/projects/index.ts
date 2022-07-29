import buildSearchFilter from '@api/helpers/buildSearchFilter'
import { getQueryFromRequest } from '@api/helpers/getQueryFromRequest'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/projects/index.js'

async function ProjectListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const maybeQuery = getQueryFromRequest(req)

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
        const filterOrderBy: any = {
          name: 'asc',
        }
        if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
          const projects = await prisma.project.findMany({
            include: filterInclude,
            orderBy: filterOrderBy,
          })

          res.status(200).json({
            data: projects,
            hasError: false,
          })

          return
        }

        const searchFilter = buildSearchFilter(['name'], maybeQuery)
        const foundProjects = await prisma.project.findMany({
          include: filterInclude,
          orderBy: filterOrderBy,
          ...searchFilter,
        })

        res.status(200).json({
          data: foundProjects,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newProjectData: any = R.pick(
          ['description', 'isUnlocked', 'leadId', 'name', 'need', 'note', 'organizationId', 'userId'],
          req.body,
        )

        const newProjectContributorsData = req.body.contributorIds.map(contributorId => ({
          contributor: {
            connect: {
              id: contributorId,
            },
          },
        }))
        if (newProjectContributorsData.length > 0) {
          newProjectData.contributors = {
            create: newProjectContributorsData,
          }
        }

        const newProject = await prisma.project.create({
          data: newProjectData,
        })

        res.status(201).json({
          data: newProject,
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

export default withAuthentication(ProjectListEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
