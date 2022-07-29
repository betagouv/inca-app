import { createSlice } from '@reduxjs/toolkit'

export const adminProjectListSlice = createSlice({
  initialState: {
    pageIndex: 0,
  },
  name: 'adminProjectList',
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

export const { updatePageIndex } = adminProjectListSlice.actions

export const adminProjectListReducer = adminProjectListSlice.reducer
