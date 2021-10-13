import { Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
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
    label: 'Nom',
  },
  {
    key: 'seats',
    label: 'Besoin',
  },
  {
    accent: 'secondary',

    // eslint-disable-next-line no-alert
    action: id => window.alert(`Edit ${id}`),

    Icon: Edit,
    label: 'Edit user',
    type: 'action',
  },
  {
    accent: 'danger',

    // eslint-disable-next-line no-alert
    action: id => window.alert(`Delete ${id}`),

    Icon: Trash,
    label: 'Delete user',
    type: 'action',
  },
]

export default function ProjectList() {
  const api = useApi()
  const [projects, setProjects] = useState([])
  const isMounted = useIsMounted()

  const loadProjects = async () => {
    const res = await api.get('projects')
    if (res.data === null) {
      return
    }

    if (isMounted()) {
      setProjects(res.data)
    }
  }

  useEffect(() => {
    loadProjects()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Title>Projets</Title>

      <Table columns={COLUMNS} data={projects} />
    </Box>
  )
}
