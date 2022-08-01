import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AdminContributorListState = {
  pageIndex: number
  query: string
}
const INITIAL_STATE: AdminContributorListState = {
  pageIndex: 0,
  query: '',
}

export const adminContributorListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'adminContributorList',
  reducers: {
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setPageIndex, setQuery } = adminContributorListSlice.actions

export const adminContributorListReducer = adminContributorListSlice.reducer
