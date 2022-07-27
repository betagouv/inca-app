import { ProjectContributorState } from '@prisma/client'
import { map, pipe, prop, sortBy } from 'ramda'

import type { FullProject } from '@common/types'
import type { Contributor, ContributorsOnProjects } from '@prisma/client'

export const getContributorLinksFromProject: (project: FullProject) => Array<
  Contributor & {
    isContacted: boolean
    isRefused: boolean
    isSuccessful: boolean
    isValidated: boolean
    state: ProjectContributorState
  }
> = pipe(
  prop('contributors'),
  map(
    ({
      contributor,
      state,
    }: ContributorsOnProjects & {
      contributor: Contributor
    }) => ({
      ...contributor,
      isContacted: state === ProjectContributorState.CONTACTED,
      isRefused: state === ProjectContributorState.REFUSED,
      isSuccessful: state === ProjectContributorState.SUCCESSFUL,
      isValidated: state === ProjectContributorState.VALIDATED,
      state,
    }),
  ),
  sortBy(prop('lastName')),
)
