import { authenticationReducer } from '@app/slices/authenticationSlice'
import { contributorsReducer } from '@app/slices/contributorsSlice'
import { leadsReducer } from '@app/slices/leadsSlice'
import { organizationsReducer } from '@app/slices/organizationsSlice'
import { projectsReducer } from '@app/slices/projectsSlice'
import { prospectsReducer } from '@app/slices/prospectsSlice'
import { configureStore } from '@reduxjs/toolkit'

import { api } from './services/api'

export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  reducer: {
    authentication: authenticationReducer,
    contributors: contributorsReducer,
    leads: leadsReducer,
    organizations: organizationsReducer,
    projects: projectsReducer,
    prospects: prospectsReducer,

    [api.reducerPath]: api.reducer,
  },
})

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
