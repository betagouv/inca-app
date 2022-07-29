import { createSlice } from '@reduxjs/toolkit'

export const adminLeadListSlice = createSlice({
  initialState: {
    pageIndex: 0,
  },
  name: 'adminLeadList',
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

export const { updatePageIndex } = adminLeadListSlice.actions

export const adminLeadListReducer = adminLeadListSlice.reducer
