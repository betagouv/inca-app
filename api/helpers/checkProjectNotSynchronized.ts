import { prisma } from '@api/libs/prisma'

import { PROJECT_FIELD_MAP, PROJECT_SUBMISSION_PARSING_MODE, TellMeSubmission } from '../libs/TellMeSubmission'

export async function checkProjectNotSynchronized(rawSubmission) {
  const submission = new TellMeSubmission(rawSubmission, PROJECT_SUBMISSION_PARSING_MODE, PROJECT_FIELD_MAP)
  const maybeProject = await prisma.project.findUnique({
    where: {
      synchronizationId: submission.submissionId,
    },
  })

  return {
    ...rawSubmission,
    isNotSynchronized: maybeProject === null,
  }
}
