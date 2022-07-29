import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/synchronizations/[id].js'

async function SynchronizationEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeSynchronization = await prisma.synchronization.findUnique({
          where: {
            id,
          },
        })
        if (maybeSynchronization === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedSynchronization = await prisma.synchronization.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedSynchronization,
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

export default withAuthentication(SynchronizationEndpoint, [Role.ADMINISTRATOR])
