import handleError from '@api/helpers/handleError'
import ApiError from '@api/libs/ApiError'
import { prisma } from '@api/libs/prisma'
import withAuthentication from '@api/middlewares/withAuthentication'
import { Role } from '@prisma/client'

import type { NextApiRequest, NextApiResponse } from 'next'

const ERROR_PATH = 'pages/api/settings/index.js'

async function SettingListEndpoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const settings = await prisma.setting.findMany({
          orderBy: {
            key: 'asc',
          },
        })

        res.status(200).json({
          data: settings,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    case 'PATCH':
      try {
        const updatedSettings = req.body
        if (!Array.isArray(updatedSettings)) {
          handleError(new ApiError('Not found.', 422, true), ERROR_PATH, res)

          return
        }

        const updatedSettingsData = await Promise.all(
          updatedSettings.map(async ({ key, value }) =>
            prisma.setting.upsert({
              create: {
                key,
                value,
              },
              update: {
                value,
              },
              where: {
                key,
              },
            }),
          ),
        )

        res.status(202).json({
          data: updatedSettingsData,
          hasError: false,
        })
      } catch (err) {
        handleError(err, ERROR_PATH, res)
      }

      return

    default:
      handleError(new ApiError('Method not allowed.', 405, true), ERROR_PATH, res)
  }
}

export default withAuthentication(SettingListEndpoint, [Role.ADMINISTRATOR])
