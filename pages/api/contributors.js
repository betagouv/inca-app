import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/contributors.js'

async function ContributorsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const { query: maybeQuery } = req.query

    if (maybeQuery === undefined) {
      const contributors = await req.db.contributor.findMany({
        include: {
          projects: {
            include: {
              project: true,
            },
          },
        },
      })

      res.status(200).json({
        data: contributors,
      })

      return
    }

    const searchQuery = maybeQuery.replace(/\s+/g, ' | ')
    const orStatements = ['firstName', 'lastName'].map(field => ({ [field]: { search: searchQuery } }))
    const filteredContributors = await req.db.contributor.findMany({
      where: {
        OR: orStatements,
      },
    })

    res.status(200).json({
      data: filteredContributors,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(ContributorsController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
