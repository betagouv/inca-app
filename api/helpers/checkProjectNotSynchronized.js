import { PROJECT_FIELD_MAP, PROJECT_SUBMISSION_PARSING_MODE, TellMeSubmission } from '../libs/TellMeSubmission'

export async function checkProjectNotSynchronized(rawSubmission, req) {
  const submission = new TellMeSubmission(rawSubmission, PROJECT_SUBMISSION_PARSING_MODE, PROJECT_FIELD_MAP)
  const maybeProject = await req.db.project.findUnique({
    where: {
      synchronizationId: submission.submissionId,
    },
  })

  return {
    ...rawSubmission,
    isNotSynchronized: maybeProject === null,
  }
}
