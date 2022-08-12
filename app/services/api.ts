import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { RootState } from '../store'
import type { Prospect } from '@prisma/client'

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const { accessToken } = (getState() as RootState).authentication

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }

      return headers
    },
  }),
  endpoints: builder => ({
    getProspects: builder.query<Api.ResponseBody<Prospect[]>, void>({
      query: () => '/prospects',
      transformResponse: (response: Api.ResponseBody)
    }),
  }),
})

export const { useGetProspectsQuery } = api
