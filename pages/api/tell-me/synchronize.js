import { Temporal } from '@js-temporal/polyfill'

import { checkContributorNotSynchronized } from '../../../api/helpers/checkContributorNotSynchronized'
import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import { TellMeConnection } from '../../../api/libs/TellMeConnection'
import { TellMeContributorSubmission } from '../../../api/libs/TellMeContributorSubmission'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/tell-me/synchronize.js'

const SYNCHRO_START_DATE = Temporal.Instant.from('2022-06-16T00:00:00.000Z')

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

async function TellMeController(req, res) {
  if (req.method !== 'POST') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    const tellMe = new TellMeConnection()

    const contributorSubmissions = await tellMe.getSubmissions(process.env.TELL_ME_CONTRIBUTOR_SURVEY_ID)
    const recentSubmissions = contributorSubmissions.filter(rawSubmission => {
      const submissionDate = Temporal.Instant.from(rawSubmission.submittedAt)

      return Temporal.Instant.compare(submissionDate, SYNCHRO_START_DATE) >= 0
    })
    const submissionsWithSynchronizationCheck = await Promise.all(
      recentSubmissions.map(rawSubmission => checkContributorNotSynchronized(rawSubmission, req)),
    )

    const notExistingSubmissions = submissionsWithSynchronizationCheck.filter(
      rawSubmission => rawSubmission.isNotSynchronized,
    )
    const createdContributors = await Promise.all(
      notExistingSubmissions
        .map(rawSubmission => new TellMeContributorSubmission(rawSubmission))
        .map(submission => submission.extractContributor())
        .map(async contributor =>
          req.db.contributor.create({
            data: contributor,
          }),
        ),
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
      error: err.toString(),
    })
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(TellMeController, [USER_ROLE.ADMINISTRATOR]))
