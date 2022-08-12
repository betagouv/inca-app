import { Status } from '@app/types'
import { createSlice } from '@reduxjs/toolkit'

import type { Contributor } from '@prisma/client'
import type { PayloadAction } from '@reduxjs/toolkit'

type AdminContributorListState = {
  data: Contributor[]
  isLoading: boolean
  pageIndex: number
  query: string
  status: Status
}
const INITIAL_STATE: AdminContributorListState = {
  data: [],
  isLoading: true,
  pageIndex: 0,
  query: '',
  status: Status.IDLE,
}

export const contributorsSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'contributors',
  reducers: {
    setData: (state, action: PayloadAction<Contributor[]>) => {
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

export const contributorsReducer = contributorsSlice.reducer

export const { setPageIndex, setQuery } = contributorsSlice.actions
