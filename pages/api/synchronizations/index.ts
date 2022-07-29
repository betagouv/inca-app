/* eslint-disable no-await-in-loop, no-nested-ternary, no-restricted-syntax */

import { getContributorDataFromSurveyEntry } from '@api/helpers/getContributorDataFromSurveyEntry'
import { getLeadDataFromSurveyEntry } from '@api/helpers/getLeadDataFromSurveyEntry'
import { getOrganizationDataFromSurveyEntry } from '@api/helpers/getOrganizationDataFromSurveyEntry'
import { getProjectDataFromSurveyEntry } from '@api/helpers/getProjectDataFromSurveyEntry'
import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import { TellMeApi } from '@api/libs/TellMeApi'
import withAuthentication from '@api/middlewares/withAuthentication'
import { dayjs } from '@common/libs/dayjs'
import { Prisma, Role, SettingKey } from '@prisma/client'
import { getUser } from 'nexauth'
import { propEq } from 'ramda'

import type { NextApiRequest, NextApiResponse } from 'next'

const { SYNCHRONIZATION_START_DATE } = process.env
if (!SYNCHRONIZATION_START_DATE) {
  console.error('Fatal: `SYNCHRONIZATION_START_DATE` env is undefined.')
  process.exit(1)
}

const ERROR_PATH = 'pages/api/syncronizations/index.ts'

async function SynchronizationListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const synchronizations = await prisma.synchronization.findMany({
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        res.status(200).json({
          data: synchronizations,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'POST':
      try {
        const settings = await prisma.setting.findMany()
        const tellMePat = settings.find(propEq('key', SettingKey.TELL_ME_PAT))
        if (!tellMePat) {
          handleError(new ApiError(`Missing setting: ${SettingKey.TELL_ME_PAT}.`, 400, true), ERROR_PATH, res)

          return
        }
        const tellMeUrl = settings.find(propEq('key', SettingKey.TELL_ME_URL))
        if (!tellMeUrl) {
          handleError(new ApiError(`Missing setting: ${SettingKey.TELL_ME_URL}.`, 400, true), ERROR_PATH, res)

          return
        }
        const tellMeContributorSurveyId = settings.find(propEq('key', SettingKey.TELL_ME_CONTRIBUTOR_SURVEY_ID))
        if (!tellMeContributorSurveyId) {
          handleError(
            new ApiError(`Missing setting: ${SettingKey.TELL_ME_CONTRIBUTOR_SURVEY_ID}.`, 400, true),
            ERROR_PATH,
            res,
          )

          return
        }
        const tellMeLeadSurveyId = settings.find(propEq('key', SettingKey.TELL_ME_LEAD_SURVEY_ID))
        if (!tellMeLeadSurveyId) {
          handleError(
            new ApiError(`Missing setting: ${SettingKey.TELL_ME_LEAD_SURVEY_ID}.`, 400, true),
            ERROR_PATH,
            res,
          )

          return
        }

        const me = await getUser(req)
        if (!me) {
          handleError(new ApiError('`me` is undefined. This should never happen.', 400, true), ERROR_PATH, res)

          return
        }

        const tellMeApi = new TellMeApi({
          contributorSurveyId: tellMeContributorSurveyId.value,
          leadSurveyId: tellMeLeadSurveyId.value,
          pat: tellMePat.value,
          url: tellMeUrl.value,
        })
        const lastSynchronization = await prisma.synchronization.findFirst({
          orderBy: {
            createdAt: 'desc',
          },
        })

        const contactCategories = await prisma.contactCategory.findMany()

        const contributorSurveyEntries = await tellMeApi.getContributorSurveyEntries()
        const contributorSurveyEntriesAfterSyncronizationStartDate = contributorSurveyEntries.filter(
          ({ submittedAt }) => dayjs(submittedAt).isSameOrAfter(SYNCHRONIZATION_START_DATE),
        )
        const lastSynchronizedContributorSurveyEntryIndex =
          lastSynchronization !== null && lastSynchronization.lastContributorSurveyEntryId.length
            ? contributorSurveyEntriesAfterSyncronizationStartDate.findIndex(
                propEq('id', lastSynchronization.lastContributorSurveyEntryId),
              )
            : Infinity
        const newContributorSurveyEntries = contributorSurveyEntriesAfterSyncronizationStartDate.slice(
          0,
          lastSynchronizedContributorSurveyEntryIndex,
        )

        for (const newContributorSurveyEntry of newContributorSurveyEntries) {
          const newContributorData = getContributorDataFromSurveyEntry(newContributorSurveyEntry, contactCategories)
          await prisma.contributor.create({
            data: newContributorData,
          })
        }

        const leadSurveyEntries = await tellMeApi.getLeadSurveyEntries()
        const leadSurveyEntriesAfterSyncronizationStartDate = leadSurveyEntries.filter(({ submittedAt }) =>
          dayjs(submittedAt).isSameOrAfter(SYNCHRONIZATION_START_DATE),
        )
        const lastSynchronizedLeadSurveyEntryIndex =
          lastSynchronization !== null && lastSynchronization.lastLeadSurveyEntryId.length
            ? leadSurveyEntriesAfterSyncronizationStartDate.findIndex(
                propEq('id', lastSynchronization.lastLeadSurveyEntryId),
              )
            : Infinity
        const newLeadSurveyEntries = leadSurveyEntriesAfterSyncronizationStartDate.slice(
          0,
          lastSynchronizedLeadSurveyEntryIndex,
        )

        for (const newLeadSurveyEntry of newLeadSurveyEntries) {
          const newOrganizationData = getOrganizationDataFromSurveyEntry(newLeadSurveyEntry)
          const newOrganization = await prisma.organization.create({
            data: newOrganizationData,
          })

          const newLeadData = getLeadDataFromSurveyEntry(newLeadSurveyEntry, contactCategories, newOrganization.id)
          const newLead = await prisma.lead.create({
            data: newLeadData,
          })

          const newProjectData = getProjectDataFromSurveyEntry(
            newLeadSurveyEntry,
            newLead.id,
            newOrganization.id,
            me.id,
          )
          await prisma.project.create({
            data: newProjectData,
          })
        }

        if (newContributorSurveyEntries.length || newLeadSurveyEntries.length) {
          const user = await getUser(req)
          if (!user) {
            throw new Error('`user` is undefined. This should never happen.')
          }

          const newSynchronizationData: Prisma.SynchronizationCreateArgs['data'] = {
            isSuccessful: true,
            lastContributorSurveyEntryId: newContributorSurveyEntries.length
              ? newContributorSurveyEntries[0].id
              : lastSynchronization !== null
              ? lastSynchronization.lastContributorSurveyEntryId
              : '',
            lastLeadSurveyEntryId: newLeadSurveyEntries.length
              ? newLeadSurveyEntries[0].id
              : lastSynchronization !== null
              ? lastSynchronization.lastLeadSurveyEntryId
              : '',
            userId: user.id,
          }
          const newSynchronization = await prisma.synchronization.create({
            data: newSynchronizationData,
          })

          res.status(201).json({
            data: newSynchronization,
            hasError: false,
          })

          return
        }

        res.status(204).end()
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    default:
      handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }
}

export default withAuthentication(SynchronizationListEndpoint, [Role.ADMINISTRATOR])
