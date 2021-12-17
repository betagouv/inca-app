import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

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
        const maybeContributor = await req.db.contributor.findUnique({
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
        const newContributorData = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'phone'],
          req.body,
        )

        await req.db.contributor.create({
          data: newContributorData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeContributor = await req.db.contributor.findUnique({
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
        await req.db.contributor.update({
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
        const maybeContributor = await req.db.contributor.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContributor === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await req.db.contributor.delete({
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

export default withPrisma(withAuthentication(ContributorController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
