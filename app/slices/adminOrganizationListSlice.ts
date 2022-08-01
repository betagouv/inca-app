import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AdminOrganizationListState = {
  pageIndex: number
  query: string
}
const INITIAL_STATE: AdminOrganizationListState = {
  pageIndex: 0,
  query: '',
}

export const adminOrganizationListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'adminOrganizationList',
  reducers: {
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setPageIndex, setQuery } = adminOrganizationListSlice.actions

export const adminOrganizationListReducer = adminOrganizationListSlice.reducer
