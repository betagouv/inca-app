import type { TellMe } from '@api/libs/TellMe'

export function getNoteFromSurveyEntry(surveyEntry: TellMe.DataEntry): string {
  return surveyEntry.answers
    .filter(({ type }) => type !== 'file')
    .map(({ question, rawValue }) => `${question.value}\n${rawValue}`)
    .join('\n\n')
}
