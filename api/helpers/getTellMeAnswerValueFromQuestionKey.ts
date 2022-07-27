import { pathEq } from 'ramda'

import type { TellMe } from '@api/libs/TellMe'

export function getTellMeAnswerValueFromQuestionKey(surveyDataEntry: TellMe.DataEntry, questionKey: string): string {
  const { answers } = surveyDataEntry

  const answer = answers.find(pathEq(['question', 'key'], questionKey))
  if (!answer) {
    return ''
  }

  return answer.rawValue
}
