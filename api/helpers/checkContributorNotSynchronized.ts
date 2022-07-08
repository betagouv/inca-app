import { prisma } from '@api/libs/prisma'

import { CONTRIBUTOR_FIELD_MAP, CONTRIBUTOR_SUBMISSION_PARSING_MODE, TellMeSubmission } from '../libs/TellMeSubmission'

export async function checkContributorNotSynchronized(rawSubmission) {
  const submission = new TellMeSubmission(rawSubmission, CONTRIBUTOR_SUBMISSION_PARSING_MODE, CONTRIBUTOR_FIELD_MAP)
  const maybeContributor = await prisma.contributor.findUnique({
    where: {
      synchronizationId: submission.submissionId,
    },
  })

  return {
    ...rawSubmission,
    isNotSynchronized: maybeContributor === null,
  }
}
