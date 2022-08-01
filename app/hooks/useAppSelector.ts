import { useSelector } from 'react-redux'

import type { RootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
