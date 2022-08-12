import { Status } from '@app/types'
import { createSlice } from '@reduxjs/toolkit'

import type { Organization } from '@prisma/client'
import type { PayloadAction } from '@reduxjs/toolkit'

type OrganizationsState = {
  data: Organization[]
  isLoading: boolean
  pageIndex: number
  query: string
  status: Status
}
const INITIAL_STATE: OrganizationsState = {
  data: [],
  isLoading: true,
  pageIndex: 0,
  query: '',
  status: Status.IDLE,
}

export const organizationsSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'organizations',
  reducers: {
    setData: (state, action: PayloadAction<Organization[]>) => {
      state.data = action.payload
      state.isLoading = false
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
})

export const organizationsReducer = organizationsSlice.reducer

export const { setPageIndex, setQuery } = organizationsSlice.actions
