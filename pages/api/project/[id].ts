import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import { PROJECT_CONTRIBUTOR_STATE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/project/[id].js'

async function ProjectController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
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
            id: req.query.id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        res.status(200).json({
          data: maybeProject,
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

        await prisma.project.create({
          data: newProjectData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const projectId = req.query.id

        const maybeProject = await prisma.project.findUnique({
          include: {
            contributors: true,
          },
          where: {
            id: projectId,
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
              id: projectId,
            },
          })
        }

        const updatedProjectData = R.pick(
          ['description', 'isUnlocked', 'leadId', 'name', 'need', 'note', 'organizationId', 'userId'],
          req.body,
        )

        await prisma.project.update({
          data: updatedProjectData,
          where: {
            id: projectId,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const projectId = req.query.id

        const maybeProject = await prisma.project.findUnique({
          where: {
            id: projectId,
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
            id: projectId,
          },
        })

        await prisma.project.delete({
          where: {
            id: projectId,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withAuthentication(ProjectController, [Role.ADMINISTRATOR, Role.MANAGER])
