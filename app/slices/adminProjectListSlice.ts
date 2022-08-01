import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AdminProjectListState = {
  pageIndex: number
  query: string
}
const INITIAL_STATE: AdminProjectListState = {
  pageIndex: 0,
  query: '',
}

export const adminProjectListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'adminProjectList',
  reducers: {
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const { setPageIndex, setQuery } = adminProjectListSlice.actions

export const adminProjectListReducer = adminProjectListSlice.reducer
