import { Button, Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'

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
    if (res === null) {
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
    <AdminBox>
      <AdminHeader>
        <Title>Projets</Title>

        <Button size="small">Ajouter un projet</Button>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={projects} />
      </Card>
    </AdminBox>
  )
}
