import { createSlice } from '@reduxjs/toolkit'

export const adminProspectListSlice = createSlice({
  initialState: {
    pageIndex: 0,
  },
  name: 'adminProspectList',
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

export const { updatePageIndex } = adminProspectListSlice.actions

export const adminProspectListReducer = adminProspectListSlice.reducer
