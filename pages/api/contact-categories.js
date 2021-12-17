import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'
import withAuthentication from '../../api/middlewares/withAuthentication'
import withPrisma from '../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../common/constants'

const ERROR_PATH = 'pages/api/contact-categories.js'

async function ContactCategoriesController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const contactCategories = await req.db.contactCategory.findMany({
      orderBy: {
        label: 'asc',
      },
    })

    res.status(200).json({
      data: contactCategories,
    })
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(ContactCategoriesController, [USER_ROLE.ADMINISTRATOR, USER_ROLE.MANAGER]))
