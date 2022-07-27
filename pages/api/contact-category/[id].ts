import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/contact-category/[id].js'

async function ContactCategoryController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeContactCategory,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newContactCategoryData: any = R.pick(
          ['contributorSurveyAnswerValue', 'description', 'label', 'leadSurveyAnswerValue'],
          req.body,
        )

        await prisma.contactCategory.create({
          data: newContactCategoryData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedContactCategoryData = R.pick(
          ['contributorSurveyAnswerValue', 'description', 'label', 'leadSurveyAnswerValue'],
          req.body,
        )
        await prisma.contactCategory.update({
          data: updatedContactCategoryData,
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
        const maybeContactCategory = await prisma.contactCategory.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await prisma.contactCategory.delete({
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

export default withAuthentication(ContactCategoryController, [Role.ADMINISTRATOR, Role.MANAGER])
