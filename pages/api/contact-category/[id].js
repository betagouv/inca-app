import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

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
        const maybeContactCategory = await req.db.contactCategory.findUnique({
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
        const newContactCategoryData = R.pick(['description', 'label'], req.body)

        await req.db.contactCategory.create({
          data: newContactCategoryData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeContactCategory = await req.db.contactCategory.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedContactCategoryData = R.pick(['description', 'label'], req.body)
        await req.db.contactCategory.update({
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
        const maybeContactCategory = await req.db.contactCategory.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeContactCategory === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await req.db.contactCategory.delete({
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

export default withPrisma(withAuthentication(ContactCategoryController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
