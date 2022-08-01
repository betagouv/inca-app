import { TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useCallback, useMemo } from 'react'

import type { ChangeEvent } from 'react'

type QuerierProps = {
  defaultQuery: string
  onQuery: (newQuery: string) => void | Promise<void>
}
export function Querier({ defaultQuery, onQuery }: QuerierProps) {
  const changeHandler = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      onQuery(event.target.value)
    },
    [onQuery],
  )

  const handleChange = useMemo(() => debounce(changeHandler, 250), [changeHandler])

  return <TextInput defaultValue={defaultQuery} onChange={handleChange} placeholder="Rechercher" />
}
