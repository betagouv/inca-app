import { prisma } from '@api/libs/prisma'
import { Role } from '@prisma/client'
import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'

const ERROR_PATH = 'pages/api/prospect/[id].js'

async function ProspectController(req, res) {
  if (!['DELETE', 'GET', 'PATCH', 'POST'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeProspect = await prisma.prospect.findUnique({
          include: {
            contactCategory: true,
          },
          where: {
            id: req.query.id,
          },
        })
        if (maybeProspect === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        res.status(200).json({
          data: maybeProspect,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const newProspectData: any = R.pick(
          ['contactCategoryId', 'email', 'firstName', 'lastName', 'note', 'organization', 'phone', 'position'],
          req.body,
        )

        await prisma.prospect.create({
          data: newProspectData,
        })

        res.status(201).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const prospectId = req.query.id

        const maybeProspect = await prisma.prospect.findUnique({
          where: {
            id: prospectId,
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

        await prisma.prospect.update({
          data: updatedProspectData,
          where: {
            id: prospectId,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'DELETE':
      try {
        const prospectId = req.query.id

        const maybeProspect = await prisma.prospect.findUnique({
          where: {
            id: prospectId,
          },
        })
        if (maybeProspect === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await prisma.prospect.delete({
          where: {
            id: prospectId,
          },
        })

        res.status(202).json({})
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }
  }
}

export default withAuthentication(ProspectController, [Role.ADMINISTRATOR, Role.MANAGER])
