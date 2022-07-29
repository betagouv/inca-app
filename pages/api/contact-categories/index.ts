import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/contact-categories/index.js'

async function ContactCategoryListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const contactCategories = await prisma.contactCategory.findMany({
          orderBy: {
            label: 'asc',
          },
        })

        res.status(200).json({
          data: contactCategories,
          hasError: false,
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

        const newContactCategory = await prisma.contactCategory.create({
          data: newContactCategoryData,
        })

        res.status(201).json({
          data: newContactCategory,
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

export default withAuthentication(ContactCategoryListEndpoint, [Role.ADMINISTRATOR, Role.MANAGER])
