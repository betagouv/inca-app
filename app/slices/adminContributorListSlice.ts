import { createSlice } from '@reduxjs/toolkit'

export const adminContributorListSlice = createSlice({
  initialState: {
    pageIndex: 0,
  },
  name: 'adminContributorList',
  reducers: {
    updatePageIndex: (
      state,
      action: {
        payload: number
      },
    ) => {
      state.pageIndex = action.payload
    },
  },
})

export const { updatePageIndex } = adminContributorListSlice.actions

export const adminContributorListReducer = adminContributorListSlice.reducer
