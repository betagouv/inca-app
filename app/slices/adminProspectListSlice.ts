import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AdminProspectListState = {
  pageIndex: number
  query: string
}
const INITIAL_STATE: AdminProspectListState = {
  pageIndex: 0,
  query: '',
}

export const adminProspectListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'adminProspectList',
  reducers: {
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setPageIndex, setQuery } = adminProspectListSlice.actions

export const adminProspectListReducer = adminProspectListSlice.reducer
