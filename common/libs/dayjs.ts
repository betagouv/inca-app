import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(isSameOrAfter)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.locale('fr')

export { dayjs }
