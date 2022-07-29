import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/leads/[id].js'

async function LeadController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeLead = await prisma.lead.findUnique({
          include: {
            contactCategory: true,
            organization: true,
            projects: true,
          },
          where: {
            id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeLead,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeLead = await prisma.lead.findUnique({
          where: {
            id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedLeadData = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'organizationId', 'phone', 'position'],
          req.body,
        )
        const updatedLead = await prisma.lead.update({
          data: updatedLeadData,
          where: {
            id,
          },
        })

        res.status(202).json({
          data: updatedLead,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeLead = await prisma.lead.findUnique({
          where: {
            id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedLead = await prisma.lead.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedLead,
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

export default withAuthentication(LeadController, [Role.ADMINISTRATOR, Role.MANAGER])
