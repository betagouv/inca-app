import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/prospects.js'

async function ProspectsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query

    if (maybeQuery === undefined) {
      const prospects = await req.db.prospect.findMany({
        include: {
          contactCategory: true,
        },
      })

      res.status(200).json({
        data: prospects,
      })

      return
    }

    const searchQuery = maybeQuery.replace(/\s+/g, ' | ')
    const orStatements = ['firstName', 'lastName', 'organization'].map(field => ({ [field]: { search: searchQuery } }))
    const filteredProspects = await req.db.prospect.findMany({
      where: {
        OR: orStatements,
      },
    })

    res.status(200).json({
      data: filteredProspects,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(ProspectsController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
