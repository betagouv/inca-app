import * as R from 'ramda'

import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/LeadController()'

async function LeadController(req, res) {
  if (!['DELETE', 'GET', 'PATCH'].includes(req.method)) {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  // eslint-disable-next-line default-case
  switch (req.method) {
    case 'GET':
      try {
        const maybeLead = await req.db.lead.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        res.status(200).json({
          data: maybeLead,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const maybeLead = await req.db.lead.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)
        }

        const updatedLeadData = R.pick(['email', 'firstName', 'lastName', 'note', 'phone'], req.body)
        await req.db.lead.update({
          data: updatedLeadData,
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
        const maybeLead = await req.db.lead.findUnique({
          where: {
            id: req.query.id,
          },
        })
        if (maybeLead === null) {
          handleError(new ApiError('Not found.', 404, true), ERROR_PATH, res)

          return
        }

        await req.db.lead.delete({
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

export default withPrisma(withAuthentication(LeadController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
