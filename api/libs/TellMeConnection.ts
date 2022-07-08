import ky from 'ky-universal'

import handleError from '../helpers/handleError'

import type { KyInstance } from 'ky/distribution/types/ky'

class TellMeConnection {
  ky: KyInstance

  constructor() {
    if (!process.env.TELL_ME_TOKEN) {
      throw new Error('TELL_ME_TOKEN env is undefined')
    }

    this.ky = ky.create({
      prefixUrl: process.env.TELL_ME_URL,
      searchParams: {
        personalAccessToken: process.env.TELL_ME_TOKEN,
      },
    })
  }

  async get(path) {
    try {
      const maybeBody = await this.ky.get(path)

      return await maybeBody.json()
    } catch (err) {
      return handleError(err, 'api/helpers/tell-me/synchronize/TellMeConnection.get()')
    }
  }

  async getSubmissions(surveyId) {
    try {
      const maybeBody = await this.get(`surveys/${surveyId}`)

      return maybeBody.data.data.entries
    } catch (err) {
      return handleError(err, 'api/helpers/tell-me/synchronize/TellMeConnection.getSubmissions()')
    }
  }
}

export { TellMeConnection }
