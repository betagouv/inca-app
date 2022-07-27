import { getTellMeAnswerValueFromQuestionKey } from './getTellMeAnswerValueFromQuestionKey'

import type { TellMe } from '@api/libs/TellMe'
import type { Prisma } from '@prisma/client'

export function getOrganizationDataFromSurveyEntry(
  surveyEntry: TellMe.DataEntry,
): Prisma.OrganizationCreateArgs['data'] {
  const name = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'ORGANIZATION')

  const organizationData: Prisma.OrganizationCreateArgs['data'] = {
    name,
  }

  return organizationData
}
