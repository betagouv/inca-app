import { Temporal } from '@js-temporal/polyfill'

import { checkContributorNotSynchronized } from '../../../api/helpers/checkContributorNotSynchronized'
import { checkProjectNotSynchronized } from '../../../api/helpers/checkProjectNotSynchronized'
import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import { TellMeConnection } from '../../../api/libs/TellMeConnection'
import {
  CONTRIBUTOR_FIELD_MAP,
  CONTRIBUTOR_SUBMISSION_PARSING_MODE,
  PROJECT_FIELD_MAP,
  PROJECT_SUBMISSION_PARSING_MODE,
  TellMeSubmission,
} from '../../../api/libs/TellMeSubmission'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/tell-me/synchronize.js'

const SYNCHRO_START_DATE = Temporal.Instant.from(process.env.TELL_ME_SYNCHRO_START_DATE)

function filterOlderSubmission(rawSubmission) {
  const submissionDate = Temporal.Instant.from(rawSubmission.submittedAt)

  return Temporal.Instant.compare(submissionDate, SYNCHRO_START_DATE) >= 0
}

async function synchronizeProjects(tellMe, req) {
  const rawSubmissions = await tellMe.getSubmissions(process.env.TELL_ME_PROJECT_SURVEY_ID)
  const recentSubmissions = rawSubmissions.filter(rawSubmission => filterOlderSubmission(rawSubmission))
  const submissionsWithSynchronizationCheck = await Promise.all(
    recentSubmissions.map(rawSubmission => checkProjectNotSynchronized(rawSubmission, req)),
  )

  const notExistingSubmissions = submissionsWithSynchronizationCheck.filter(
    rawSubmission => rawSubmission.isNotSynchronized,
  )
  const createdProjects = await Promise.all(
    notExistingSubmissions
      .map(rawSubmission => new TellMeSubmission(rawSubmission, PROJECT_SUBMISSION_PARSING_MODE, PROJECT_FIELD_MAP))
      .map(submission => submission.extractProject())
      .map(async project =>
        req.db.project.create({
          data: project,
        }),
      ),
  )
  const projectsLog = {
    created: createdProjects.length,
    read: rawSubmissions.length,
    recent: recentSubmissions.length,
  }

  return projectsLog
}

async function synchronizeContributors(tellMe, req) {
  const rawSubmissions = await tellMe.getSubmissions(process.env.TELL_ME_CONTRIBUTOR_SURVEY_ID)
  const recentSubmissions = rawSubmissions.filter(rawSubmission => filterOlderSubmission(rawSubmission))
  const submissionsWithSynchronizationCheck = await Promise.all(
    recentSubmissions.map(rawSubmission => checkContributorNotSynchronized(rawSubmission, req)),
  )

  const notExistingSubmissions = submissionsWithSynchronizationCheck.filter(
    rawSubmission => rawSubmission.isNotSynchronized,
  )
  const createdContributors = await Promise.all(
    notExistingSubmissions
      .map(
        rawSubmission =>
          new TellMeSubmission(rawSubmission, CONTRIBUTOR_SUBMISSION_PARSING_MODE, CONTRIBUTOR_FIELD_MAP),
      )
      .map(submission => submission.extractContributor())
      .map(async contributor =>
        req.db.contributor.create({
          data: contributor,
        }),
      ),
  )
  const contributorsLog = {
    created: createdContributors.length,
    read: rawSubmissions.length,
    recent: recentSubmissions.length,
  }

  return contributorsLog
}

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

    const contributorsLog = await synchronizeContributors(tellMe, req)
    const projectsLog = await synchronizeProjects(tellMe, req)
    await createSynchronization(req, true, {
      contributors: contributorsLog,
      projects: projectsLog,
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
