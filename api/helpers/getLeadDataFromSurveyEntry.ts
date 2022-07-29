import { propEq } from 'ramda'

import { getNoteFromSurveyEntry } from './getNoteFromSurveyEntry'
import { getTellMeAnswerValueFromQuestionKey } from './getTellMeAnswerValueFromQuestionKey'

import type { TellMe } from '@api/libs/TellMe'
import type { ContactCategory, Prisma } from '@prisma/client'

const { SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY } = process.env
if (!SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY) {
  console.error('Fatal: `SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY` env is undefined.')
  process.exit(1)
}

export function getLeadDataFromSurveyEntry(
  surveyEntry: TellMe.DataEntry,
  contactCategories: ContactCategory[],
  organizationId: string,
): Prisma.LeadCreateArgs['data'] {
  const email = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'EMAIL')
  const firstName = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'FIRST_NAME')
  const lastName = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'LAST_NAME')
  const phone = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'PHONE')
  const category = getTellMeAnswerValueFromQuestionKey(surveyEntry, 'CATEGORY')

  const contactCategory = contactCategories.find(propEq('contributorSurveyAnswerValue', category))
  const safeContactCategory =
    contactCategory ?? contactCategories.find(propEq('label', SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY))
  if (!safeContactCategory) {
    throw new Error('Unable to find "Autres" contact category.')
  }

  const note = getNoteFromSurveyEntry(surveyEntry)

  const leadData: Prisma.LeadCreateArgs['data'] = {
    contactCategoryId: safeContactCategory.id,
    email,
    firstName,
    lastName,
    note,
    organizationId,
    phone,
  }

  return leadData
}
