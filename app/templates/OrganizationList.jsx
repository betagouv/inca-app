import { Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`

const COLUMNS = [
  {
    key: 'name',
    label: 'Dénomination',
  },
]

export default function OrganizationList() {
  const api = useApi()
  const [organizations, setOrganizations] = useState([])
  const isMounted = useIsMounted()

  const loadOrganizations = async () => {
    const res = await api.get('organizations')
    if (res.data === null) {
      return
    }

    if (isMounted()) {
      setOrganizations(res.data)
    }
  }

  useEffect(() => {
    loadOrganizations()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Title>Organizations</Title>

      <Table columns={COLUMNS} data={organizations} />
    </Box>
  )
}
