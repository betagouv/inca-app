import { Status } from '@app/types'
import { createSlice } from '@reduxjs/toolkit'

import type { Lead } from '@prisma/client'
import type { PayloadAction } from '@reduxjs/toolkit'

type AdminLeadListState = {
  data: Lead[]
  isLoading: boolean
  pageIndex: number
  query: string
  status: Status
}
const INITIAL_STATE: AdminLeadListState = {
  data: [],
  isLoading: true,
  pageIndex: 0,
  query: '',
  status: Status.IDLE,
}

export const leadsSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'leads',
  reducers: {
    setData: (state, action: PayloadAction<Lead[]>) => {
      state.data = action.payload
      state.isLoading = false
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const leadsReducer = leadsSlice.reducer

export const { setPageIndex, setQuery } = leadsSlice.actions
