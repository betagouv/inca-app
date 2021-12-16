import { Button, Card, Table } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { Edit, Users, Trash, Lock, Unlock } from 'react-feather'
import { useHistory } from 'react-router-dom'

import { USER_ROLE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import useIsMounted from '../hooks/useIsMounted'
import DeletionModal from '../organisms/DeletionModal'

const BASE_COLUMNS = [
  {
    isSortable: true,
    key: 'name',
    label: 'Nom',
  },
]

export default function ProjectList() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
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
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeProjectDeletionModal = () => {
    setHasDeletionModal(false)
  }

  const confirmProjectDeletion = async id => {
    const project = R.find(R.propEq('id', id))(projects)

    setSelectedId(id)
    setSelectedEntity(project.name)
    setHasDeletionModal(true)
  }

  const deleteProject = async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`project/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadProjects()
  }

  const goToProjectLinker = id => {
    history.push(`/project/linker/${id}`)
  }

  const goToProjectEditor = id => {
    history.push(`/project/${id}`)
  }

  const updateProjectLockState = async (id, isUnlocked) => {
    await api.patch(`project/${id}`, { isUnlocked })

    await loadProjects()
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      action: updateProjectLockState,
      IconOff: Lock,
      IconOn: Unlock,
      key: 'isUnlocked',
      label: 'Projet débloqué',
      labelOff: 'Projet bloqué',
      labelOn: 'Projet débloqué',
      type: 'boolean',
      withTooltip: true,
    },
    {
      accent: 'secondary',
      action: goToProjectLinker,
      Icon: Users,
      label: 'Gérer les mise en relation de ce projet',
      type: 'action',
    },
    {
      accent: 'secondary',
      action: goToProjectEditor,
      Icon: Edit,
      label: 'Éditer ce projet',
      type: 'action',
    },
  ]

  if (user.role === USER_ROLE.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: confirmProjectDeletion,
      Icon: Trash,
      label: 'Supprimer ce projet',
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
        <Table columns={columns} data={projects} defaultSortedKey="name" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeProjectDeletionModal} onConfirm={deleteProject} />
      )}
    </AdminBox>
  )
}
