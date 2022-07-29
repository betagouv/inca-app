import { createSlice } from '@reduxjs/toolkit'

export const adminOrganizationListSlice = createSlice({
  initialState: {
    pageIndex: 0,
  },
  name: 'adminOrganizationList',
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

export const { updatePageIndex } = adminOrganizationListSlice.actions

export const adminOrganizationListReducer = adminOrganizationListSlice.reducer
