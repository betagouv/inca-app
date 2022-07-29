import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/contributors/[id].js'

async function ContributorEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeContributor = await prisma.contributor.findUnique({
          include: {
            contactCategory: true,
            projects: {
              include: {
                project: true,
              },
            },
          },
          where: {
            id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeContributor,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeContributor = await prisma.contributor.findUnique({
          where: {
            id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedContributorData = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'phone'],
          req.body,
        )
        const updatedContributor = await prisma.contributor.update({
          data: updatedContributorData,
          where: {
            id,
          },
        })

        res.status(202).json({
          data: updatedContributor,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeContributor = await prisma.contributor.findUnique({
          where: {
            id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedContributor = await prisma.contributor.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedContributor,
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

export default withAuthentication(ContributorEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
