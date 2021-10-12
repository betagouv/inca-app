import { PrismaClient } from '@prisma/client'

import handleError from '../helpers/handleError'

function withPrismaSingleton() {
  /** @type {import('@prisma/client').PrismaClient} */
  let prismaInstance = null

  return function withPrisma(handler) {
    return async (req, res) => {
      try {
        if (prismaInstance === null) {
          prismaInstance = new PrismaClient()
        }

        req.db = prismaInstance

        await handler(req, res)
      } catch (err) {
        handleError(err, 'middlewares/withPrisma()', res)
      } finally {
        await prismaInstance.$disconnect()
      }
    }
  }
}

export default withPrismaSingleton()
