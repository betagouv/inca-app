import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/contact-categories/[id].js'

async function ContactCategoryEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const id = getIdFromRequest(req)

        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeContactCategory,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const id = getIdFromRequest(req)

        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedContactCategoryData = R.pick(
          ['contributorSurveyAnswerValue', 'description', 'label', 'leadSurveyAnswerValue'],
          req.body,
        )
        const updatedContactCategory = await prisma.contactCategory.update({
          data: updatedContactCategoryData,
          where: {
            id,
          },
        })

        res.status(202).json({
          data: updatedContactCategory,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const id = getIdFromRequest(req)

        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        const deletedContactCategory = await prisma.contactCategory.delete({
          where: {
            id,
          },
        })

        res.status(202).json({
          data: deletedContactCategory,
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

export default withAuthentication(ContactCategoryEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
