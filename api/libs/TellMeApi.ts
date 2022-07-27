import axios from 'axios'

import handleError from '../helpers/handleError'

import type { TellMe } from './TellMe'
import type { AxiosInstance } from 'axios'

type TellMeApiConfig = {
  contributorSurveyId: string
  leadSurveyId: string
  pat: string
  url: string
}

export class TellMeApi {
  #axios: AxiosInstance
  #contributorSurveyId: string
  #leadSurveyId: string

  constructor({ contributorSurveyId, leadSurveyId, pat, url }: TellMeApiConfig) {
    this.#axios = axios.create({
      baseURL: url,
      params: {
        personalAccessToken: pat,
      },
    })

    this.#contributorSurveyId = contributorSurveyId
    this.#leadSurveyId = leadSurveyId
  }

  async getContributorSurveyEntries(): Promise<TellMe.DataEntry[]> {
    try {
      const path = `api/surveys/${this.#contributorSurveyId}`
      const { data: responseData } = await this.#axios.get<
        Api.ResponseBody<{
          data: TellMe.Data
        }>
      >(path)
      if (responseData.hasError) {
        return []
      }

      return responseData.data.data.entries
    } catch (err) {
      handleError(err, 'api/libs/TellMeApi.getContributorSurveyEntries()')

      return []
    }
  }

  async getLeadSurveyEntries(): Promise<TellMe.DataEntry[]> {
    try {
      const path = `api/surveys/${this.#leadSurveyId}`
      const { data: responseData } = await this.#axios.get<
        Api.ResponseBody<{
          data: TellMe.Data
        }>
      >(path)
      if (responseData.hasError) {
        return []
      }

      return responseData.data.data.entries
    } catch (err) {
      handleError(err, 'api/libs/TellMeApi.getEntries()')

      return []
    }
  }
}
