/**
 * @param {*} req
 * @param {string} collection
 *
 * @return {Promise<number>}
 */
export default async function getRandomPipedriveId(req, collection) {
  const maybePipedriveId = 1000000 + Math.floor(Math.random() * 9000000)
  const pipedriveIdCount = await req.db[collection].count({
    where: {
      pipedriveId: maybePipedriveId,
    },
  })

  if (pipedriveIdCount === 0) {
    return maybePipedriveId
  }

  return getRandomPipedriveId(req)
}
