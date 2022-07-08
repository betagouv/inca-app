import type { Role } from '@prisma/client'

export const PROSPECT_STATE = {
  ADDED: 'ADDED',
  CONTACTED: 'CONTACTED',
  REFUSED: 'REFUSED',
  REGISTERED: 'REGISTERED',
}

export const PROJECT_CONTRIBUTOR_STATE = {
  ASSIGNED: 'ASSIGNED',
  CONTACTED: 'CONTACTED',
  REFUSED: 'REFUSED',
  SUCCESSFUL: 'SUCCESSFUL',
  VALIDATED: 'VALIDATED',
}

export const USER_ROLE_LABEL: Record<Role, string> = {
  ADMINISTRATOR: 'Administrateur·rice',
  MANAGER: 'Chargé·e de projets',
  MEMBER: 'Membre',
}
