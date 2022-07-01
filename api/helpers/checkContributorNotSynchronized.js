import { TellMeSubmission } from '../libs/TellMeSubmission'

export async function checkContributorNotSynchronized(rawSubmission, req) {
  const submission = new TellMeSubmission(rawSubmission)
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
