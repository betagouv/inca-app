import type { Contributor, ContributorsOnProjects, Lead, Organization, Project, User } from '@prisma/client'

export type FullContributor = Contributor & {
  projects: (ContributorsOnProjects & {
    project: Project
  })[]
}

export type FullProject = Project & {
  contributors: (ContributorsOnProjects & {
    contributor: Contributor
  })[]
  lead: Lead
  organization: Organization
  user: User
}

export type Option = {
  label: string
  value: string
}
