import * as R from 'ramda'

import getRandomPipedriveId from '../../../api/helpers/getRandomPipedriveId'
import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/organization/[id].js'

async function OrganizationController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeOrganization = await req.db.organization.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeOrganization,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newOrganizationdData = R.pick(['name', 'note'], req.body)
        newOrganizationdData.pipedriveId = await getRandomPipedriveId(req, 'organization')

        await req.db.organization.create({
          data: newOrganizationdData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeOrganization = await req.db.organization.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedOrganizationData = R.pick(['name', 'note'], req.body)
        await req.db.organization.update({
          data: updatedOrganizationData,
          where: {
            id: req.query.id,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const maybeOrganization = await req.db.organization.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await req.db.organization.delete({
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

export default withPrisma(withAuthentication(OrganizationController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
