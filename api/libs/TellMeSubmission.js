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
 * @typedef ParsingMode
 * @type {"NONE"|"RAW"|"CONSOLIDATED"}
 */
const CONTRIBUTOR_SUBMISSION_PARSING_MODE = 'CONSOLIDATED'

const CONTRIBUTOR_FIELD_MAP = {
  // TODO: add CONTRIBUTOR_TYPE handling
  email: 'EMAIL',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME',
  phone: 'PHONE',
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
}

export { TellMeSubmission, CONTRIBUTOR_SUBMISSION_PARSING_MODE, CONTRIBUTOR_FIELD_MAP }
