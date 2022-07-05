import { TellMeContributorSubmission } from '../libs/TellMeContributorSubmission'

export async function checkContributorNotSynchronized(rawSubmission, req) {
  const submission = new TellMeContributorSubmission(rawSubmission)
  const maybeContributor = await req.db.contributor.findUnique({
    where: {
      synchronizationId: submission.submissionId,
    },
  })

  return {
    ...rawSubmission,
    isNotSynchronized: maybeContributor === null,
  }
}
