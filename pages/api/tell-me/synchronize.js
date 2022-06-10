import { Temporal } from '@js-temporal/polyfill'

import handleError from '../../../api/helpers/handleError'
import { TellMeConnection } from '../../../api/helpers/tell-me/synchronize'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/tell-me/synchronize.js'
const SYNCHRO_START_DATE = Temporal.Instant.from('2022-06-10T00:00:00.000Z')

async function createSynchronization(req, success, info) {
  const userId = req.me.id

  return req.db.synchronization.create({
    data: {
      info: JSON.stringify(info, null, 2),
      success,
      userId,
    },
  })
}

async function createContributor(submission, req) {
  return req.db.contributor.create({
    data: {
      email: '...',
      firstName: submission.id,
      lastName: '...',
      note: JSON.stringify(submission, null, 2),
      synchronizationId: submission.id,
    },
  })
}

function getSubmissionId(submission) {
  return `${submission.openedAt}|${submission.submittedAt}`
}

async function checkContributorNotSynchronized(submission, req) {
  const submissionId = getSubmissionId(submission)
  const maybeContributor = await req.db.contributor.findUnique({
    where: {
      synchronizationId: submissionId,
    },
  })

  return {
    ...submission,
    isNotSynchronized: maybeContributor === null,
  }
}

function extractAnswers(answers) {
  return answers.map(answer => ({
    [answer.question.value]: answer.rawValue,
  }))
}

function formatSubmission(submission) {
  return {
    answers: extractAnswers(submission.answers),
    id: getSubmissionId(submission),
    openedAt: submission.openedAt,
    submittedAt: submission.submittedAt,
  }
}

async function TellMeController(req, res) {
  if (req.method !== 'POST') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const tellMe = new TellMeConnection()

    const contributorSubmissions = await tellMe.getSubmissions(process.env.TELL_ME_CONTRIBUTOR_SURVEY_ID)
    const recentSubmissions = contributorSubmissions.filter(submission => {
      const submissionDate = Temporal.Instant.from(submission.submittedAt)

      return Temporal.Instant.compare(submissionDate, SYNCHRO_START_DATE) >= 0
    })
    const submissionsWithSynchronizationCheck = await Promise.all(
      recentSubmissions.map(submission => checkContributorNotSynchronized(submission, req)),
    )

    const notExistingSubmissions = submissionsWithSynchronizationCheck.filter(
      submission => submission.isNotSynchronized,
    )
    const createdContributors = await Promise.all(
      notExistingSubmissions
        .map(submission => formatSubmission(submission))
        .map(async submission => createContributor(submission, req)),
    )
    await createSynchronization(req, true, {
      contributors: {
        created: createdContributors.length,
        read: contributorSubmissions.length,
        recent: recentSubmissions.length,
      },
    })

    res.status(201).json({})
  } catch (err) {
    await createSynchronization(req, false, {
      error: err,
    })
    console.error({ err })
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(TellMeController, [USER_ROLE.ADMINISTRATOR]))
