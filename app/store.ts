import { adminContributorListReducer } from '@app/slices/adminContributorListSlice'
import { adminLeadListReducer } from '@app/slices/adminLeadListSlice'
import { adminOrganizationListReducer } from '@app/slices/adminOrganizationListSlice'
import { adminProjectListReducer } from '@app/slices/adminProjectListSlice'
import { adminProspectListReducer } from '@app/slices/adminProspectListSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    adminContributorList: adminContributorListReducer,
    adminLeadList: adminLeadListReducer,
    adminOrganizationList: adminOrganizationListReducer,
    adminProjectList: adminProjectListReducer,
    adminProspectList: adminProspectListReducer,
  },
})

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
