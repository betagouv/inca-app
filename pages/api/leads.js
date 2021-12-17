import buildSearchFilter from '../../api/helpers/buildSearchFilter'
import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/leads.js'

async function LeadsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query
    const filterInclude = {
      organization: true,
    }

    if (maybeQuery === undefined || maybeQuery.trim().length === 0) {
      const leads = await req.db.lead.findMany({
        include: filterInclude,
      })

      res.status(200).json({
        data: leads,
      })

      return
    }

    const searchFilter = buildSearchFilter(['email', 'firstName', 'lastName', 'organization.name'], maybeQuery)
    const filteredLeads = await req.db.lead.findMany({
      include: filterInclude,
      ...searchFilter,
    })

    res.status(200).json({
      data: filteredLeads,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(LeadsController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
