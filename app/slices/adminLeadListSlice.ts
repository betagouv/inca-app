import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AdminLeadListState = {
  pageIndex: number
  query: string
}
const INITIAL_STATE: AdminLeadListState = {
  pageIndex: 0,
  query: '',
}

export const adminLeadListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'adminLeadList',
  reducers: {
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setPageIndex, setQuery } = adminLeadListSlice.actions

export const adminLeadListReducer = adminLeadListSlice.reducer
