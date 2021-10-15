/* eslint-disable camelcase */

import * as R from 'ramda'

import {
  PIPEDRIVE_CATEGORY_KEY,
  PIPEDRIVE_LABEL,
  PIPEDRIVE_LABEL_KEY,
  PIPEDRIVE_POSITION_KEY,
  PIPEDRIVE_TYPE,
  PIPEDRIVE_TYPE_KEY,
} from '../../../api/constants'
import cache from '../../../api/helpers/cache'
import capitalize from '../../../api/helpers/capitalize'
import handleError from '../../../api/helpers/handleError'
import ApiError from '../../../api/libs/ApiError'
import pipedrive from '../../../api/libs/pipedrive'
import withAuthentication from '../../../api/middlewares/withAuthentication'
import withPrisma from '../../../api/middlewares/withPrisma'
import { ROLE } from '../../../common/constants'

const ERROR_PATH = 'pages/api/auth/PipedriveSynchronizeController()'

const areContributors = R.filter(R.propEq(PIPEDRIVE_TYPE_KEY, PIPEDRIVE_TYPE.CONTRIBUTOR))
const areLeads = R.filter(R.propEq(PIPEDRIVE_TYPE_KEY, PIPEDRIVE_TYPE.LEAD))
const areMembers = R.filter(R.propEq(PIPEDRIVE_LABEL_KEY, PIPEDRIVE_LABEL.MEMBER))
const getCategoryLabelFromId = id => R.pipe(R.find(R.propEq('id', id)), R.prop('label'))
const getCategories = R.pipe(R.find(R.propEq('key', PIPEDRIVE_CATEGORY_KEY)), R.prop('options'))
const haveOrganization = R.reject(R.propEq('org_name', null))
const isPrimary = R.find(R.propEq('primary', true))

const normalizeContributorsWithCategories = categories =>
  R.map(({ email, first_name, id, last_name, name, phone, ...props }) => {
    const primaryEmail = isPrimary(email)
    const primaryPhone = isPrimary(phone)
    const categoryId = Number(props[PIPEDRIVE_CATEGORY_KEY])

    return {
      category: getCategoryLabelFromId(categoryId)(categories),
      email: primaryEmail.value.length > 0 ? primaryEmail.value : null,
      firstName: capitalize(first_name),
      lastName: capitalize(last_name || name),
      phone: primaryPhone.value.length > 0 ? primaryPhone.value : null,
      pipedriveId: id,
      position: props[PIPEDRIVE_POSITION_KEY],
    }
  })

const normalizeLeadsWithCategories = categories =>
  R.map(({ email, first_name, id, last_name, name, org_id, phone, ...props }) => {
    const primaryEmail = isPrimary(email)
    const primaryPhone = isPrimary(phone)
    const categoryId = Number(props[PIPEDRIVE_CATEGORY_KEY])

    return {
      category: getCategoryLabelFromId(categoryId)(categories),
      email: primaryEmail.value.length > 0 ? primaryEmail.value : null,
      firstName: capitalize(first_name),
      lastName: capitalize(last_name || name),
      organization: {
        name: org_id.name,
        pipedriveId: org_id.value,
      },
      phone: primaryPhone.value.length > 0 ? primaryPhone.value : null,
      pipedriveId: id,
      position: props[PIPEDRIVE_POSITION_KEY],
    }
  })

const convertToNormalizedContributorsWithCategories = categories =>
  R.pipe(areMembers, areContributors, normalizeContributorsWithCategories(categories))
const convertToNormalizedLeadsWithCategories = categories =>
  R.pipe(areMembers, areLeads, haveOrganization, normalizeLeadsWithCategories(categories))

const loadPersons = async (previousPersons = [], start = 0) => {
  const newPersons = await pipedrive.get('/persons', { start })

  const persons = [...previousPersons, ...newPersons]
  if (newPersons.length < 100) {
    return persons
  }

  return loadPersons(persons, start + 100)
}

async function PipedriveSynchronizeController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  try {
    await cache.cache(
      'PIPEDRIVE_IS_SYNCHRONIZED',
      async () => {
        const personFields = await pipedrive.get('/personFields')
        const categories = getCategories(personFields)

        const persons = await loadPersons()
        const contributors = convertToNormalizedContributorsWithCategories(categories)(persons)
        const leads = convertToNormalizedLeadsWithCategories(categories)(persons)

        await req.db.contributor.createMany({
          data: contributors,
          skipDuplicates: true,
        })

        await Promise.all(
          leads.map(async leadWithOrganization => {
            const organization = R.prop('organization')(leadWithOrganization)
            const lead = R.omit(['organization'])(leadWithOrganization)

            const leadCount = await req.db.lead.count({
              where: {
                pipedriveId: lead.pipedriveId,
              },
            })
            if (leadCount === 1) {
              return
            }

            const leadData = lead

            const organizationCount = await req.db.organization.count({
              where: {
                pipedriveId: organization.pipedriveId,
              },
            })
            if (organizationCount === 0) {
              leadData.organization = {
                create: organization,
              }
            } else {
              leadData.organization = {
                connect: {
                  pipedriveId: organization.pipedriveId,
                },
              }
            }

            await req.db.lead.create({
              data: leadData,
            })
          }),
        )

        return true
      },
      15,
    )

    res.status(204).end()
  } catch (err) {
    handleError(err, ERROR_PATH, res)
  }
}

export default withPrisma(withAuthentication(PipedriveSynchronizeController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
