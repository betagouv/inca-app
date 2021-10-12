/* eslint-disable no-underscore-dangle */

import NodeCache from 'node-cache'

class Cache {
  constructor() {
    this._nodeCache = new NodeCache()
  }

  /**
   *
   * @param {string} key
   * @param {Promise<any>} asyncCall
   * @param {number} ttlInSeconds
   *
   * @return {Promise<any>}
   */
  async cache(key, asyncCall, ttlInSeconds = 300) {
    const maybeValue = this._nodeCache.get(key)
    if (maybeValue === undefined) {
      const newValue = await asyncCall()

      this._nodeCache.set(key, newValue, ttlInSeconds)

      return newValue
    }

    return maybeValue
  }
}

export default new Cache()
