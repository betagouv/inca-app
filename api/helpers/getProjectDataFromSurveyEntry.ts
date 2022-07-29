import { getTellMeAnswerValueFromQuestionKey } from './getTellMeAnswerValueFromQuestionKey'

import type { TellMe } from '@api/libs/TellMe'
import type { Prisma } from '@prisma/client'

export function getProjectDataFromSurveyEntry(
  surveyEntry: TellMe.DataEntry,
  leadId: string,
  organizationId: string,
  userId: string,
): Prisma.ProjectCreateArgs['data'] {
  const name = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'PROJECT')

  const projectData: Prisma.ProjectCreateArgs['data'] = {
    leadId,
    name,
    organizationId,
    userId,
  }

  return projectData
}
