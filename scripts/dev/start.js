const shell = require('shelljs')

const { PORT } = process.env

shell.exec(`next dev -p ${PORT || 3000}`)
