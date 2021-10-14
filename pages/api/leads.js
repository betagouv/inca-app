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
    const { query: maybeQuery } = req.query

    if (maybeQuery === undefined) {
      const leads = await req.db.lead.findMany({
        include: {
          organization: true,
        },
      })

      res.status(200).json({
        data: leads,
      })

      return
    }

    const queryTerms = maybeQuery.split(/\s+/)
    const orStatements = ['firstName', 'lastName']
      .map(field =>
        queryTerms.map(queryTerm => ({
          [field]: {
            contains: queryTerm,
            mode: 'insensitive',
          },
        })),
      )
      .flat()
    const filteredLeads = await req.db.lead.findMany({
      include: {
        organization: true,
      },
      where: {
        OR: orStatements,
      },
    })

    res.status(200).json({
      data: filteredLeads,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(LeadsController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
