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

export default function ContributorList() {
  const api = useApi()
  const [contributors, setContributors] = useState([])
  const isMounted = useIsMounted()

  const loadContributors = async () => {
    const res = await api.get('contributors')
    if (res.data === null) {
      return
    }

    if (isMounted()) {
      setContributors(res.data)
    }
  }

  useEffect(() => {
    loadContributors()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Title>Contributeurs</Title>

      <Table columns={COLUMNS} data={contributors} />
    </Box>
  )
}
