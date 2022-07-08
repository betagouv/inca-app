import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import glob from 'glob'
import shell from 'shelljs'
import { promisify } from 'util'

const globAsync = promisify(glob)

const { POSTGRES_PASSWORD, POSTGRES_USER } = process.env
const BCRYPT_SALT_WORK_FACTOR = 10

async function restoreFromProdBackup() {
  const backupFilePaths = await globAsync('./.backups/*.sql')
  const lastBackupFilePath = backupFilePaths.sort().reverse()[0]
  const lastDevBackupFilePath = lastBackupFilePath.replace(/\.sql$/, '.tmp')

  const backupSource = await fs.readFile(lastBackupFilePath, 'utf-8')
  const backupUser = backupSource.match(/DROP ROLE "([^"]+)";/)[1]
  const devBackupSource = backupSource
    .replace(/PASSWORD '[^']+'/, `PASSWORD '${POSTGRES_PASSWORD}'`)
    .replaceAll(backupUser, POSTGRES_USER)

  await fs.writeFile(lastDevBackupFilePath, devBackupSource, 'utf-8')

  shell.exec(`make restore`)

  const prismaInstance = new PrismaClient()

  const testPassword = await bcrypt.hash('test', BCRYPT_SALT_WORK_FACTOR)
  const users = await prismaInstance.user.findMany()
  await Promise.all(
    users.map(async ({ id }) => {
      await prismaInstance.user.update({
        data: {
          password: testPassword,
        },
        where: {
          id,
        },
      })
    }),
  )

  await fs.unlink(lastDevBackupFilePath)
}

restoreFromProdBackup()
