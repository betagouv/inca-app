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

const ERROR_PATH = 'pages/api/auth/PipedriveLeadsController()'

const areLeads = R.filter(R.propEq(PIPEDRIVE_TYPE_KEY, PIPEDRIVE_TYPE.LEAD))
const areMembers = R.filter(R.propEq(PIPEDRIVE_LABEL_KEY, PIPEDRIVE_LABEL.MEMBER))
const haveOrganization = R.reject(R.propEq('org_name', null))
const findLeadWithNameMatching = query => {
  const queryRegExp = new RegExp(query, 'i')

  return R.filter(({ name }) => queryRegExp.test(name))
}
const getCategoryLabelFromId = id => R.pipe(R.find(R.propEq('id', id)), R.prop('label'))
const getCategories = R.pipe(R.find(R.propEq('key', PIPEDRIVE_CATEGORY_KEY)), R.prop('options'))
const isPrimary = R.find(R.propEq('primary', true))
const normalizeLeadsWithCategories = categories =>
  R.map(({ email, first_name, id, last_name, name, org_name, phone, ...props }) => {
    const primaryEmail = isPrimary(email)
    const primaryPhone = isPrimary(phone)
    const categoryId = Number(props[PIPEDRIVE_CATEGORY_KEY])

    return {
      category: getCategoryLabelFromId(categoryId)(categories),
      email: primaryEmail.value.length > 0 ? primaryEmail.value : null,
      name: capitalize(`${first_name} ${last_name || name}`),
      organization: org_name,
      phone: primaryPhone.value.length > 0 ? primaryPhone.value : null,
      pipedriveId: id,
      position: props[PIPEDRIVE_POSITION_KEY],
    }
  })

const convertToNormalizedLeadsWithCategories = categories =>
  R.pipe(areMembers, areLeads, haveOrganization, normalizeLeadsWithCategories(categories))

async function PipedriveLeadsController(req, res) {
  if (req.method !== 'GET') {
    handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)

    return
  }

  const { query: maybeQuery } = req.query

  const categories = await cache.cache('PIPEDRIVE_CATEGORIES', async () => {
    const personFields = await pipedrive.get('/personFields')
    const categories = getCategories(personFields)

    return categories
  })

  const leads = await cache.cache('PIPEDRIVE_Leads', async () => {
    const persons = await pipedrive.get('/persons')
    const leads = convertToNormalizedLeadsWithCategories(categories)(persons)

    return leads
  })

  if (maybeQuery === undefined) {
    res.status(200).json({
      data: leads,
    })

    return
  }

  const filteredLeads = findLeadWithNameMatching(maybeQuery)(leads)

  res.status(200).json({
    data: filteredLeads,
  })
}

export default withPrisma(withAuthentication(PipedriveLeadsController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
