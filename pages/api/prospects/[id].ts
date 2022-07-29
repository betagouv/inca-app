import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/prospects/[id].js'

async function ProspectController(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeProspect = await prisma.prospect.findUnique({
          include: {
            contactCategory: true,
          },
          where: {
            id,
          },
        })
        if (maybeProspect === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        res.status(200).json({
          data: maybeProspect,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeProspect = await prisma.prospect.findUnique({
          where: {
            id,
          },
        })
        if (maybeProspect === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const updatedProspectData = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'organization', 'phone', 'position'],
          req.body,
        )
        const updatedProspect = await prisma.prospect.update({
          data: updatedProspectData,
          where: {
            id,
          },
        })

        res.status(202).json({
          data: updatedProspect,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeProspect = await prisma.prospect.findUnique({
          where: {
            id,
          },
        })
        if (maybeProspect === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedProspect = await prisma.prospect.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedProspect,
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

export default withAuthentication(ProspectController, [Role.ADMINISTRATOR, Role.MANAGER])
