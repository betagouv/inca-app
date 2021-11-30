import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { PROJECT_CONTRIBUTOR_STATE, ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/ProjectController()'

async function ProjectController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeProject = await req.db.project.findUnique({
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
        const newProjectData = R.pick(
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

        await req.db.project.create({
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

        const maybeProject = await req.db.project.findUnique({
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
            R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.ASSIGNED)),
            R.map(R.prop('contributorId')),
            R.without(req.body.contributorIds),
          )(maybeProject.contributors)

          const contributorIds = R.map(R.prop('contributorId'))(maybeProject.contributors)
          const contributorIdsToConnect = R.without(contributorIds)(req.body.contributorIds)

          await req.db.project.update({
            data: {
              contributors: {
                create: contributorIdsToConnect.map(contributorId => ({
                  contributor: {
                    connect: { id: contributorId },
                  },
                })),
                deleteMany: {
                  OR: contributorIdsToDelete.map(contributorId => ({ contributorId })),
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

        await req.db.project.update({
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
        const maybeProject = await req.db.project.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await req.db.project.delete({
          where: {
            id: req.query.id,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withPrisma(withAuthentication(ProjectController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
