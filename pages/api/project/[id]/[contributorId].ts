import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import handleError from '../../../../api/helpers/handleError'
import ApiError from '../../../../api/libs/ApiError'
import withAuthentication from '../../../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/project/[id]/[contributorId].js'

async function ProjectController(req, res) {
  if (!['PATCH'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'PATCH':
      try {
        const { contributorId, id: projectId } = req.query

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

        await prisma.project.update({
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

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withAuthentication(ProjectController, [Role.ADMINISTRATOR, Role.MANAGER])
