import { ProjectContributorState } from '@prisma/client'
import { map, pipe, prop, sortBy } from 'ramda'

import type { FullContributor } from '@common/types'
import type { ContributorsOnProjects, Project } from '@prisma/client'

export const getProjectLinksFromContributor: (contributor: FullContributor) => Array<
  Project & {
    isContacted: boolean
    isRefused: boolean
    isSuccessful: boolean
    isValidated: boolean
    state: ProjectContributorState
  }
> = pipe(
  prop('projects'),
  map(
    ({
      project,
      state,
    }: ContributorsOnProjects & {
      project: Project
    }) => ({
      ...project,
      isContacted: state === ProjectContributorState.CONTACTED,
      isRefused: state === ProjectContributorState.REFUSED,
      isSuccessful: state === ProjectContributorState.SUCCESSFUL,
      isValidated: state === ProjectContributorState.VALIDATED,
      state,
    }),
  ),
  sortBy(prop('name')),
)
