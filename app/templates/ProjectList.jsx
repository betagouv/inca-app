import { Button, Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Users, Trash } from 'react-feather'
import { useHistory } from 'react-router-dom'

import { ROLE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import useIsMounted from '../hooks/useIsMounted'

const BASE_COLUMNS = [
  {
    key: 'name',
    label: 'Nom',
  },
  // {
  //   key: 'hasStarted',
  //   label: 'D',
  //   type: 'boolean',
  // },
  // {
  //   key: 'hasEnded',
  //   label: 'T',
  //   type: 'boolean',
  // },
]

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth()

  const loadProjects = async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null || maybeBody.hasError) {
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

  const goToProjectLinker = id => {
    history.push(`/project/manager/${id}`)
  }

  const goToProjectEditor = id => {
    history.push(`/project/${id}`)
  }

  const deleteProject = async id => {
    const maybeBody = await api.delete(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadProjects()
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',

      // eslint-disable-next-line no-alert
      action: goToProjectLinker,

      Icon: Users,
      label: 'project',
      type: 'action',
    },
    {
      accent: 'secondary',

      action: goToProjectEditor,

      Icon: Edit,
      label: 'Edit project',
      type: 'action',
    },
  ]

  if (user.role === ROLE.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',

      action: deleteProject,

      Icon: Trash,
      label: 'Delete project',
      type: 'action',
    })
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Projets</Title>

        <Button onClick={() => goToProjectEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <Card>
        <Table columns={columns} data={projects} />
      </Card>
    </AdminBox>
  )
}
