/* eslint-disable no-underscore-dangle */

import axios from 'axios'

import handleError from '../helpers/handleError'

const { PIPEDRIVE_API_DOMAIN, PIPEDRIVE_API_KEY } = process.env
const ERROR_PATH = 'pages/api/auth/TestController()'

class Pipedrive {
  constructor() {
    this._baseUrl = `https://${PIPEDRIVE_API_DOMAIN}.pipedrive.com/api/v1`
  }

  async get(path, params = {}) {
    try {
      const url = `${this._baseUrl}${path}`
      const config = {
        params: {
          ...params,
          api_token: PIPEDRIVE_API_KEY,
        },
      }

      const res = await axios.get(url, config)
      if (!res.data.success) {
        handleError(`Pipedrive API replied with an unsuccesful payload.`, ERROR_PATH)

        return null
      }

      return res.data.data
    } catch (err) {
      handleError(err, ERROR_PATH)

      return null
    }
  }
}

export default new Pipedrive()
