import { api } from '@app/services/api'
import { Status } from '@app/types'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

import type { Prospect } from '@prisma/client'
import type { PayloadAction } from '@reduxjs/toolkit'

type ProspectsState = {
  data: Prospect[]
  isLoading: boolean
  pageIndex: number
  query: string
  status: Status
}
const INITIAL_STATE: ProspectsState = {
  data: [],
  isLoading: true,
  pageIndex: 0,
  query: '',
  status: Status.IDLE,
}

export const load = createAsyncThunk('prospects', async () => {
  const maybeBody = await api.get<Prospect[]>('prospects', { query })
  if (maybeBody === null || maybeBody.hasError) {
    toast.error('Une erreur est survenue durant le chargement des prospects.')
  }
})

export const prospectsSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'prospects',
  reducers: {
    setData: (state, action: PayloadAction<Prospect[]>) => {
      state.data = action.payload
      state.status = Status.DONE
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.pageIndex = action.payload
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
  },
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  extraReducers: builder => {
    builder.addMatcher(api.endpoints.getProspects, (state, { payload }) => {
      console.log(payload)

      state.data = payload.data
    })
  },
})

export const prospectsReducer = prospectsSlice.reducer

export const { setData, setPageIndex, setQuery } = prospectsSlice.actions
