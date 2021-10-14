import { Button, Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useHistory } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const COLUMNS = [
  {
    key: 'name',
    label: 'Nom',
  },
  {
    key: 'hasStarted',
    label: 'D',
    type: 'boolean',
  },
  {
    key: 'hasEnded',
    label: 'T',
    type: 'boolean',
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
  const [projects, setProjects] = useState([])
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadProjects = async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null) {
      return
    }

    if (isMounted()) {
      setProjects(maybeBody.data)
    }
  }

  useEffect(() => {
    loadProjects()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToProject = id => {
    history.push(`/project/${id}`)
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Projets</Title>

        <Button onClick={() => goToProject('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={projects} />
      </Card>
    </AdminBox>
  )
}
