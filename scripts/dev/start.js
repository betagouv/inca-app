import dotenv from 'dotenv'
import shell from 'shelljs'

dotenv.config({ path: '../.env' })
const { PORT } = process.env

shell.exec(`next dev -p ${PORT || 3000}`)
