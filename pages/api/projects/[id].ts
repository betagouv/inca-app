import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { PROJECT_CONTRIBUTOR_STATE } from '@common/constants'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/projects/[id].js'

async function ProjectController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeProject = await prisma.project.findUnique({
          include: {
            contributors: {
              include: {
                contributor: true,
              },
            },
            lead: true,
            organization: true,
            user: true,
          },
          where: {
            id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        res.status(200).json({
          data: maybeProject,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeProject = await prisma.project.findUnique({
          include: {
            contributors: true,
          },
          where: {
            id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        if (req.body.contributorIds !== undefined) {
          const contributorIdsToDelete = R.pipe(
            R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.ASSIGNED)) as any,
            R.map(R.prop('contributorId')),
            R.without(req.body.contributorIds),
          )(maybeProject.contributors)

          const contributorIds = R.map(R.prop('contributorId'))(maybeProject.contributors)
          const contributorIdsToConnect = R.without(contributorIds)(req.body.contributorIds)

          await prisma.project.update({
            data: {
              contributors: {
                create: contributorIdsToConnect.map(contributorId => ({
                  contributor: {
                    connect: { id: contributorId },
                  },
                })),
                deleteMany: {
                  OR: contributorIdsToDelete.map(contributorId => ({ contributorId })) as any,
                },
              },
            },
            where: {
              id,
            },
          })
        }

        const updatedProjectData = R.pick(
          ['description', 'isUnlocked', 'leadId', 'name', 'need', 'note', 'organizationId', 'userId'],
          req.body,
        )
        const updatedProject = await prisma.project.update({
          data: updatedProjectData,
          where: {
            id,
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

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeProject = await prisma.project.findUnique({
          where: {
            id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await prisma.project.update({
          data: {
            contributors: {
              deleteMany: {},
            },
          },
          where: {
            id,
          },
        })
        const deletedProject = await prisma.project.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedProject,
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
