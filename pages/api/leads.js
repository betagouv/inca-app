import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/LeadsController()'

async function LeadsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const leads = await req.db.lead.findMany()

    res.status(200).json({
      data: leads,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(LeadsController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
