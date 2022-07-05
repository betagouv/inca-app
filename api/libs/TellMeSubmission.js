/**
 * @typedef RawAnswer
 * @property {Object} data
 * @property {string} type
 * @property {Object} question
 * @property {string} question.id
 * @property {?string} question.key
 * @property {string} question.value
 * @property {string} rawValue
 */

/**
 * @typedef RawSubmission
 * @property {string} id
 * @property {string} openedAt - submission opening ISO date
 * @property {string} submittedAt - submission ISO date
 * @property {Array<RawAnswer>} answers
 */

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

/**
 * @typedef FormattedContributor
 * @type {Omit<
 *  import("@prisma/client").Contributor,
 * 'createdAt' | 'updatedAt' | 'id' | 'category' | 'position' | 'contactCategoryId'
 * >}
 */

/**
 * @typedef FormattedProject
 * @type {Omit<
 *  import("@prisma/client").Project,
 * 'createdAt' | 'updatedAt' | 'id' | 'need' | 'description' | 'hasStarted' | 'hasEnded' | 'isUnlocked' | 'leadId' | 'organizationId' | 'userId'
 * >}
 */

/**
 * @typedef ParsingMode
 * @type {"NONE"|"RAW"|"CONSOLIDATED"}
 */

/**
 * @type { ParsingMode }
 */
const CONTRIBUTOR_SUBMISSION_PARSING_MODE = 'CONSOLIDATED'

const CONTRIBUTOR_FIELD_MAP = {
  // TODO: add CONTRIBUTOR_TYPE handling
  email: 'EMAIL',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME',
  phone: 'PHONE',
}

/**
 * @type { ParsingMode }
 */
const PROJECT_SUBMISSION_PARSING_MODE = 'CONSOLIDATED'

const PROJECT_FIELD_MAP = {
  // TODO: add LEAD_TYPE handling
  leadEmail: 'LEAD_EMAIL',
  leadFirstName: 'LEAD_FIRSTNAME',
  leadLastName: 'LEAD_LASTNAME',
  leadPhone: 'LEAD_PHONE',
  name: 'PROJECT_NAME',
}

class TellMeSubmission {
  /**
   * @param {RawSubmission} submission
   * @param {ParsingMode} parsingMode
   * @param {Object} fieldMap
   */
  constructor(submission, parsingMode, fieldMap) {
    this.rawSubmission = submission
    this.submissionId = this.getSubmissionId()
    this.consolidatedKeys = []
    this.parsingMode = parsingMode
    this.fieldMap = fieldMap
  }

  /**
   * @param {string} fieldName
   * @param {FormattedSubmission} submission
   * @returns {string}
   */
  getFieldValue(fieldName, submission) {
    switch (this.parsingMode) {
      case 'CONSOLIDATED':
        return this.getMappedFieldValue(fieldName, submission)

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
   * @param {string} fieldName
   * @param {FormattedSubmission} submission
   * @returns {string}
   */
  getMappedFieldValue(fieldName, submission) {
    const mappedKey = this.fieldMap[fieldName]
    const mappedAnswer = submission.answers.find(answer => mappedKey === answer.key)
    if (mappedAnswer === undefined) {
      return '...'
    }
    this.consolidatedKeys.push(mappedKey)

    return mappedAnswer.value
  }

  /**
   * @returns {Array<FormattedAnswer>}
   */
  extractAnswers() {
    return this.rawSubmission.answers.map(
      /** @returns {FormattedAnswer} */
      answer => ({
        id: answer.question.id,
        key: answer.question.key,
        label: answer.question.value,
        value: answer.rawValue,
      }),
    )
  }

  getSubmissionId() {
    return `${this.rawSubmission.openedAt}|${this.rawSubmission.submittedAt}`
  }

  /**
   * @returns {FormattedSubmission}
   */
  extractSubmission() {
    return {
      answers: this.extractAnswers(),
      id: this.submissionId,
      openedAt: this.rawSubmission.openedAt,
      submittedAt: this.rawSubmission.submittedAt,
    }
  }

  /**
   * @param {FormattedAnswer} answer
   * @returns {string}
   */
  // eslint-disable-next-line class-methods-use-this
  formatNoteAnswer(answer) {
    // eslint-disable-next-line no-irregular-whitespace
    return `${answer.label.trim()} ${answer.value.trim()}`
  }

  /**
   * @param {FormattedSubmission} submission
   * @returns {string}
   */
  formatSubmissionForNotes(submission) {
    let notes
    switch (this.parsingMode) {
      case 'RAW':
        notes = submission.answers.map(answer => this.formatNoteAnswer(answer))

        break

      case 'CONSOLIDATED':
        notes = submission.answers
          .filter(answer => !this.consolidatedKeys.includes(answer.key))
          .map(answer => this.formatNoteAnswer(answer))

        break

      case 'NONE':
      default:
        notes = submission

        break
    }

    return JSON.stringify(notes, null, 2)
  }

  /**
   * @returns {FormattedContributor}
   */
  extractContributor() {
    const formattedSubmission = this.extractSubmission()
    const contributor = {
      email: this.getFieldValue('email', formattedSubmission),
      firstName: this.getFieldValue('firstName', formattedSubmission),
      lastName: this.getFieldValue('lastName', formattedSubmission),
      phone: this.getFieldValue('phone', formattedSubmission),
    }

    return {
      ...contributor,
      note: this.formatSubmissionForNotes(formattedSubmission),
      synchronizationId: this.submissionId,
    }
  }

  extractProject() {
    const formattedSubmission = this.extractSubmission()
    const project = {
      name: this.getFieldValue('name', formattedSubmission),
      organization: {
        connect: {
          id: process.env.TELL_ME_SYNCHRO_DEFAULT_ORGANIZATION_ID,
        },
      },
      user: {
        connect: {
          id: process.env.TELL_ME_SYNCHRO_DEFAULT_USER_ID,
        },
      },
    }
    const lead = {
      email: this.getFieldValue('leadEmail', formattedSubmission),
      firstName: this.getFieldValue('leadFirstName', formattedSubmission),
      lastName: this.getFieldValue('leadLastName', formattedSubmission),
      organization: {
        connect: {
          id: process.env.TELL_ME_SYNCHRO_DEFAULT_ORGANIZATION_ID,
        },
      },
      phone: this.getFieldValue('leadPhone', formattedSubmission),
    }

    return {
      ...project,
      lead: {
        /* TODO: use connectOrCreate to avoid lead duplicates ?
        connectOrCreate: {
          where: {
            email: 'viola@prisma.io',
          },
          create: {
            email: 'viola@prisma.io',
            name: 'Viola',
          },
        },
         */
        create: {
          ...lead,
        },
      },
      note: this.formatSubmissionForNotes(formattedSubmission),
      synchronizationId: this.submissionId,
    }
  }
}

export {
  TellMeSubmission,
  CONTRIBUTOR_SUBMISSION_PARSING_MODE,
  CONTRIBUTOR_FIELD_MAP,
  PROJECT_SUBMISSION_PARSING_MODE,
  PROJECT_FIELD_MAP,
}
