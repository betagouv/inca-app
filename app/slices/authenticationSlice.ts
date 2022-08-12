import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

type AuthenticationState = {
  accessToken: string | undefined
}
const INITIAL_STATE: AuthenticationState = {
  accessToken: undefined,
}

export const authenticationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'authentication',
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | undefined>) => {
      state.accessToken = action.payload
    },
  },
})

export const authenticationReducer = authenticationSlice.reducer

export const { setAccessToken } = authenticationSlice.actions
