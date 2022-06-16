import { Temporal } from '@js-temporal/polyfill'

import handleError from '../../../api/helpers/handleError'
import { TellMeConnection } from '../../../api/helpers/tell-me/synchronize'
import ApiError from '../../../api/libs/ApiError'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { USER_ROLE } from '../../../common/constants'

/**
 * @typedef FormattedAnswer
 * @property {string} id - question id
 * @property {string} key - question field key
 * @property {string} label - question field label
 * @property {string} value - answer value
 */

/**
 * @typedef FormattedSubmission
 * @property {Array<FormattedAnswer>} answers - formatted answers
 * @property {string} id - submission id
 * @property {string} openedAt - submission opening ISO date
 * @property {string} submittedAt - submission ISO date
 */

const ERROR_PATH = 'pages/api/tell-me/synchronize.js'

const SYNCHRO_START_DATE = Temporal.Instant.from('2022-06-16T00:00:00.000Z')

/** @type {"NONE"|"RAW"|"CONSOLIDATED"} */
const SUBMISSION_PARSING_MODE = 'CONSOLIDATED'
const CONTRIBUTORS_FIELD_MAP = {
  // TODO: add CONTRIBUTOR_TYPE handling
  email: 'EMAIL',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME',
  phone: 'PHONE',
}

/**
 * @param {string} fieldName
 * @param {FormattedSubmission} submission
 * @returns {string}
 */
function getMappedFieldValue(fieldName, submission) {
  const mappedAnswer = submission.answers.find(answer => {
    const mappedKey = CONTRIBUTORS_FIELD_MAP[fieldName]

    return mappedKey === answer.key
  })

  return mappedAnswer?.value ?? '...'
}

/**
 * @param {string} fieldName
 * @param {FormattedSubmission} submission
 * @returns {string}
 */
function getFieldValue(fieldName, submission) {
  switch (SUBMISSION_PARSING_MODE) {
    case 'CONSOLIDATED':
      return getMappedFieldValue(fieldName, submission)
    case 'RAW':
    case 'NONE':
    default:
      switch (fieldName) {
        case 'firstName':
          return submission.id
        default:
          return '...'
      }
  }
}

/**
 * @param {*} contributor
 * @param {FormattedSubmission} submission
 * @returns {string}
 */
function formatSubmissionForNotes(contributor, submission) {
  let notes
  switch (SUBMISSION_PARSING_MODE) {
    case 'RAW':
      // eslint-disable-next-line no-irregular-whitespace
      notes = submission.answers.map(answer => `${answer.label.trim()} ${answer.value.trim()}`)
      break
    case 'CONSOLIDATED': // TODO: implement
    case 'NONE':
    default:
      notes = submission
      break
  }

  return JSON.stringify(notes, null, 2)
}

/**
 * @param {FormattedSubmission} submission
 */
function extractSubmissionForContributor(submission) {
  const contributor = {
    email: getFieldValue('email', submission),
    firstName: getFieldValue('firstName', submission),
    lastName: getFieldValue('lastName', submission),
    phone: getFieldValue('phone', submission),
  }

  return {
    ...contributor,
    note: formatSubmissionForNotes(contributor, submission),
    synchronizationId: submission.id,
  }
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

/**
 * @param {FormattedSubmission} submission
 * @param {*} req
 * @returns
 */
async function createContributor(submission, req) {
  return req.db.contributor.create({
    data: extractSubmissionForContributor(submission),
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

/**
 * @param {*} answers
 * @returns {Array<FormattedAnswer>}
 */
function extractAnswers(answers) {
  return answers.map(
    /** @returns {FormattedAnswer} */
    answer => ({
      id: answer.question.id,
      key: answer.question.key,
      label: answer.question.value,
      value: answer.rawValue,
    }),
  )
}

/**
 *
 * @param {*} submission
 * @returns {FormattedSubmission}
 */
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
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(TellMeController, [USER_ROLE.ADMINISTRATOR]))
