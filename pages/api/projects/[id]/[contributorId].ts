import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/projects/[id]/[contributorId].js'

async function ProjectController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PATCH':
      try {
        const { contributorId, id: projectId } = req.query
        if (typeof contributorId !== 'string') {
          throw new Error('`contributorId` is not a string.')
        }
        if (typeof projectId !== 'string') {
          throw new Error('`projectId` is not a string.')
        }

        const maybeProject = await prisma.project.findUnique({
          include: {
            contributors: true,
          },
          where: {
            id: projectId,
          },
        })
        if (
          maybeProject === null ||
          R.find(R.propEq('contributorId', contributorId))(maybeProject.contributors) === undefined
        ) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const updatedProjectContributorData = R.pick(['state'], req.body)

        const updatedProject = await prisma.project.update({
          data: {
            contributors: {
              updateMany: {
                data: updatedProjectContributorData,
                where: {
                  contributorId,
                },
              },
            },
          },
          where: {
            id: projectId,
          },
        })

        res.status(202).json({
          data: updatedProject,
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

export default withAuthentication(ProjectController, [Role.ADMINISTRATOR, Role.MANAGER])
