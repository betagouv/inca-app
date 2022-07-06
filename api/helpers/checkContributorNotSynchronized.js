import { CONTRIBUTOR_FIELD_MAP, CONTRIBUTOR_SUBMISSION_PARSING_MODE, TellMeSubmission } from '../libs/TellMeSubmission'

export async function checkContributorNotSynchronized(rawSubmission, req) {
  const submission = new TellMeSubmission(rawSubmission, CONTRIBUTOR_SUBMISSION_PARSING_MODE, CONTRIBUTOR_FIELD_MAP)
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
