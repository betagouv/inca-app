import { Status } from '@app/types'
import { createSlice } from '@reduxjs/toolkit'

import type { Project } from '@prisma/client'
import type { PayloadAction } from '@reduxjs/toolkit'

type ProjectsState = {
  data: Project[]
  isLoading: boolean
  pageIndex: number
  query: string
  status: Status
}
const INITIAL_STATE: ProjectsState = {
  data: [],
  isLoading: true,
  pageIndex: 0,
  query: '',
  status: Status.IDLE,
}

export const projectsSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'projects',
  reducers: {
    setData: (state, action: PayloadAction<Project[]>) => {
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

export const projectsReducer = projectsSlice.reducer

export const { setPageIndex, setQuery } = projectsSlice.actions
