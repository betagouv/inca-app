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

const ERROR_PATH = 'pages/api/auth/PipedriveContributorsController()'

const areContributors = R.filter(R.propEq(PIPEDRIVE_TYPE_KEY, PIPEDRIVE_TYPE.CONTRIBUTOR))
const areMembers = R.filter(R.propEq(PIPEDRIVE_LABEL_KEY, PIPEDRIVE_LABEL.MEMBER))
const findContributorWithNameMatching = query => {
  const queryRegExp = new RegExp(query, 'i')

  return R.filter(({ name }) => queryRegExp.test(name))
}
const getCategoryLabelFromId = id => R.pipe(R.find(R.propEq('id', id)), R.prop('label'))
const getCategories = R.pipe(R.find(R.propEq('key', PIPEDRIVE_CATEGORY_KEY)), R.prop('options'))
const isPrimary = R.find(R.propEq('primary', true))
const normalizeContributorsWithCategories = categories =>
  R.map(({ email, first_name, id, last_name, name, phone, ...props }) => {
    const primaryEmail = isPrimary(email)
    const primaryPhone = isPrimary(phone)
    const categoryId = Number(props[PIPEDRIVE_CATEGORY_KEY])

    return {
      category: getCategoryLabelFromId(categoryId)(categories),
      email: primaryEmail.value.length > 0 ? primaryEmail.value : null,
      name: capitalize(`${first_name} ${last_name || name}`),
      phone: primaryPhone.value.length > 0 ? primaryPhone.value : null,
      pipedriveId: id,
      position: props[PIPEDRIVE_POSITION_KEY],
    }
  })

const convertToNormalizedContributorsWithCategories = categories =>
  R.pipe(areMembers, areContributors, normalizeContributorsWithCategories(categories))

async function PipedriveContributorsController(req, res) {
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

  const contributors = await cache.cache('PIPEDRIVE_CONTRIBUTORS', async () => {
    const persons = await pipedrive.get('/persons')
    const contributors = convertToNormalizedContributorsWithCategories(categories)(persons)

    return contributors
  })

  if (maybeQuery === undefined) {
    res.status(200).json({
      data: contributors,
    })

    return
  }

  const filteredContributors = findContributorWithNameMatching(maybeQuery)(contributors)

  res.status(200).json({
    data: filteredContributors,
  })
}

export default withPrisma(withAuthentication(PipedriveContributorsController, [ROLE.ADMINISTRATOR, ROLE.MANAGER]))
