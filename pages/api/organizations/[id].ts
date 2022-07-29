import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/organizations/[id].js'

async function OrganizationEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeOrganization = await prisma.organization.findUnique({
          where: {
            id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeOrganization,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeOrganization = await prisma.organization.findUnique({
          where: {
            id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedOrganizationData = R.pick(['name', 'note'], req.body)
        const updatedOrganization = await prisma.organization.update({
          data: updatedOrganizationData,
          where: {
            id,
          },
        })

        res.status(202).json({
          data: updatedOrganization,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeOrganization = await prisma.organization.findUnique({
          where: {
            id,
          },
        })
        if (maybeOrganization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedOrganization = await prisma.organization.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedOrganization,
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

export default withAuthentication(OrganizationEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
