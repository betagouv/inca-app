import handleError from '../../api/helpers/handleError'
import ApiError from '../../api/libs/ApiError'

const { npm_package_version: VERSION } = process.env
const ERROR_PATH = 'pages/api/index.js'

async function IndexController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  const data = {
    version: VERSION,
  }

  res.status(200).json({ data })
}

export default IndexController
