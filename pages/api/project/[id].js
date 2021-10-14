import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/ProjectController()'

async function ProjectController(req, res) {
  if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeProject = await req.db.project.findUnique({
          include: {
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
        }

        res.status(200).json({
          data: maybeProject,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeProject = await req.db.project.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeProject === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedProjectData = R.pick(
          ['description', 'hasEnded', 'hasStarted', 'leadId', 'name', 'need', 'note', 'organizationId', 'userId'],
          req.body,
        )
        await req.db.project.update({
          data: updatedProjectData,
          where: {
            id: req.query.id,
          },
        })

        res.status(200).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newProjectData = R.pick(
          ['description', 'hasEnded', 'hasStarted', 'leadId', 'name', 'need', 'note', 'organizationId', 'userId'],
          req.body,
        )

        await req.db.project.create({
          data: newProjectData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withPrisma(withAuthentication(ProjectController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
