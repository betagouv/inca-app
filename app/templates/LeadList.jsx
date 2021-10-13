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
    key: 'firstName',
    label: 'Prénom',
  },
  {
    key: 'lastName',
    label: 'Nom',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'phone',
    label: 'Téléphone',
  },
]

export default function LeadList() {
  const api = useApi()
  const [leads, setLeads] = useState([])
  const isMounted = useIsMounted()

  const loadLeads = async () => {
    const res = await api.get('leads')
    if (res.data === null) {
      return
    }

    if (isMounted()) {
      setLeads(res.data)
    }
  }

  useEffect(() => {
    loadLeads()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Title>Porteurs</Title>

      <Table columns={COLUMNS} data={leads} />
    </Box>
  )
}
