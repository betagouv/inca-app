/* eslint-disable no-irregular-whitespace */
const { TellMeSubmission } = require('./TellMeSubmission')

const TEST_ANSWERS = [
  {
    data: {
      isMarkdown: false,
      value: 'Answer 1.1',
    },
    question: {
      id: 'q001',
      key: null,
      value: 'Question 1 ?',
    },
    rawValue: 'Answer 1',
    type: 'string',
  },
  {
    data: {
      values: ['Answer 2.1', 'Answer 2.2'],
    },
    question: {
      id: 'q002',
      key: null,
      value: 'Question 2 ?',
    },
    rawValue: 'Answer 2.1, Answer 2.2',
    type: 'strings',
  },
  {
    data: {
      isMarkdown: false,
      value: 'John Doe',
    },
    question: {
      id: 'q003',
      key: 'name',
      value: 'Votre nom ?',
    },
    rawValue: 'John Doe',
    type: 'string',
  },
]
const CONTRIBUTOR_ANSWERS = [
  {
    data: {},
    question: {
      id: 'q001',
      key: 'EMAIL',
      value: 'Your email ?',
    },
    rawValue: 'john.doe@test.com',
    type: 'string',
  },
  {
    data: {},
    question: {
      id: 'q002',
      key: 'FIRSTNAME',
      value: 'Your first name ?',
    },
    rawValue: 'John',
    type: 'string',
  },
  {
    data: {},
    question: {
      id: 'q003',
      key: 'LASTNAME',
      value: 'Your last name ?',
    },
    rawValue: 'Doe',
    type: 'string',
  },
  {
    data: {},
    question: {
      id: 'q004',
      key: 'PHONE',
      value: 'Your phone number ?',
    },
    rawValue: '+33123456789',
    type: 'string',
  },
  {
    data: {},
    question: {
      id: 'q005',
      key: 'COMPANY',
      value: 'Your company ?',
    },
    rawValue: 'ACME Inc.',
    type: 'string',
  },
  {
    data: {},
    question: {
      id: 'q006',
      key: null,
      value: 'Your availabilities ?',
    },
    rawValue: 'Monday to Friday',
    type: 'string',
  },
]

describe('api/libs/TellMeSubmission.test.js', () => {
  describe('Core', () => {
    test('Compute submission ID', () => {
      const submittedAt = '2020-01-03T00:00:00.000Z'
      const openedAt = '2020-01-01T00:00:00.000Z'
      const submission = new TellMeSubmission({
        answers: [],
        id: '123',
        openedAt,
        submittedAt,
      })

      expect(submission.submissionId).toBe(`${openedAt}|${submittedAt}`)
    })

    test('Extract answers', () => {
      const submission = new TellMeSubmission({
        answers: TEST_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })

      expect(submission.extractAnswers()).toMatchInlineSnapshot(`
        Array [
          Object {
            "id": "q001",
            "key": null,
            "label": "Question 1 ?",
            "value": "Answer 1",
          },
          Object {
            "id": "q002",
            "key": null,
            "label": "Question 2 ?",
            "value": "Answer 2.1, Answer 2.2",
          },
          Object {
            "id": "q003",
            "key": "name",
            "label": "Votre nom ?",
            "value": "John Doe",
          },
        ]
      `)
    })

    test('Extract submission', () => {
      const submission = new TellMeSubmission({
        answers: TEST_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })

      expect(submission.extractSubmission()).toMatchInlineSnapshot(`
        Object {
          "answers": Array [
            Object {
              "id": "q001",
              "key": null,
              "label": "Question 1 ?",
              "value": "Answer 1",
            },
            Object {
              "id": "q002",
              "key": null,
              "label": "Question 2 ?",
              "value": "Answer 2.1, Answer 2.2",
            },
            Object {
              "id": "q003",
              "key": "name",
              "label": "Votre nom ?",
              "value": "John Doe",
            },
          ],
          "id": "2020-01-01T00:00:00.000Z|2020-01-03T00:00:00.000Z",
          "openedAt": "2020-01-01T00:00:00.000Z",
          "submittedAt": "2020-01-03T00:00:00.000Z",
        }
      `)
    })
  })

  describe('Internal', () => {
    test('Format submission for note', () => {
      const submission = new TellMeSubmission({
        answers: CONTRIBUTOR_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })
      const formattedSubmission = submission.extractSubmission()
      expect(submission.formatSubmissionForNotes(formattedSubmission)).toMatchInlineSnapshot(`
        "[
          \\"Your email ? john.doe@test.com\\",
          \\"Your first name ? John\\",
          \\"Your last name ? Doe\\",
          \\"Your phone number ? +33123456789\\",
          \\"Your company ? ACME Inc.\\",
          \\"Your availabilities ? Monday to Friday\\"
        ]"
      `)

      submission.getMappedFieldValue('email', formattedSubmission)
      submission.getMappedFieldValue('firstName', formattedSubmission)

      expect(submission.formatSubmissionForNotes(formattedSubmission)).toMatchInlineSnapshot(`
        "[
          \\"Your last name ? Doe\\",
          \\"Your phone number ? +33123456789\\",
          \\"Your company ? ACME Inc.\\",
          \\"Your availabilities ? Monday to Friday\\"
        ]"
      `)
    })

    test('Format note answer', () => {
      const submission = new TellMeSubmission({
        answers: TEST_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })

      expect(
        submission.formatNoteAnswer({
          id: 'q001',
          key: null,
          label: 'Question 1 ?',
          value: 'Answer 1',
        }),
      ).toEqual('Question 1 ? Answer 1')
      expect(
        submission.formatNoteAnswer({
          id: 'q002',
          key: 'FIRSTNAME',
          label: 'Your firstname ?',
          value: 'John',
        }),
      ).toEqual('Your firstname ? John')
    })

    test('Get mapped field value', () => {
      const submission = new TellMeSubmission({
        answers: CONTRIBUTOR_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })
      const formattedSubmission = submission.extractSubmission()

      expect(submission.getMappedFieldValue('email', formattedSubmission)).toEqual('john.doe@test.com')
      expect(submission.getMappedFieldValue('firstName', formattedSubmission)).toEqual('John')
      expect(submission.getMappedFieldValue('lastName', formattedSubmission)).toEqual('Doe')
      expect(submission.getMappedFieldValue('phone', formattedSubmission)).toEqual('+33123456789')
    })

    test('Get field value', () => {
      // TODO : implement various CONTRIBUTOR_SUBMISSION_PARSING_MODE
      const submission = new TellMeSubmission({
        answers: CONTRIBUTOR_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })
      const formattedSubmission = submission.extractSubmission()

      expect(submission.getFieldValue('email', formattedSubmission)).toEqual('john.doe@test.com')
      expect(submission.getFieldValue('firstName', formattedSubmission)).toEqual('John')
      expect(submission.getFieldValue('lastName', formattedSubmission)).toEqual('Doe')
      expect(submission.getFieldValue('phone', formattedSubmission)).toEqual('+33123456789')
    })
  })

  describe('Contributors', () => {
    test('Extract contributor', () => {
      const submission = new TellMeSubmission({
        answers: CONTRIBUTOR_ANSWERS,
        id: '123',
        openedAt: '2020-01-01T00:00:00.000Z',
        submittedAt: '2020-01-03T00:00:00.000Z',
      })

      expect(submission.extractContributor()).toMatchInlineSnapshot(`
        Object {
          "email": "john.doe@test.com",
          "firstName": "John",
          "lastName": "Doe",
          "note": "[
          \\"Your company ? ACME Inc.\\",
          \\"Your availabilities ? Monday to Friday\\"
        ]",
          "phone": "+33123456789",
          "synchronizationId": "2020-01-01T00:00:00.000Z|2020-01-03T00:00:00.000Z",
        }
      `)
    })
  })
})
