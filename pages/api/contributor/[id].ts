import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/contributor/[id].js'

async function ContributorController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
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
            id: req.query.id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeContributor,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newContributorData: any = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'phone'],
          req.body,
        )

        await prisma.contributor.create({
          data: newContributorData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeContributor = await prisma.contributor.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedContributorData = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'phone'],
          req.body,
        )
        await prisma.contributor.update({
          data: updatedContributorData,
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
        const maybeContributor = await prisma.contributor.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await prisma.contributor.delete({
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

export default withAuthentication(ContributorController, [Role.ADMINISTRATOR, Role.MANAGER])
