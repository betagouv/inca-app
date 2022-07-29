import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import DeletionModal from '@app/organisms/DeletionModal'
import { updatePageIndex } from '@app/slices/adminProjectListSlice'
import { Temporal } from '@js-temporal/polyfill'
import { Project, Role } from '@prisma/client'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Users, Trash, Lock, Unlock } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '@app/store'
import type { User } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'name',
    label: 'Nom',
  },
  {
    isSortable: true,
    key: 'updatedAt',
    label: 'Dernière modification',
    transform: ({ updatedAt }) => Temporal.Instant.from(updatedAt).toLocaleString('fr-FR'),
  },
]

export default function AdminProjectListPage() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const { user } = useAuth<User>()
  const dispatch = useDispatch()
  const router = useRouter()
  const pageIndex = useSelector(({ adminProjectList }: RootState) => adminProjectList.pageIndex)

  const closeProjectDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    async id => {
      const project = R.find<Project>(R.propEq('id', id))(projects)
      if (!project) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(project.name)
      setHasDeletionModal(true)
    },
    [projects],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`projects/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/projects/${id}`)
  }, [])

  const goToLinker = useCallback(id => {
    router.push(`/admin/projects/${id}/linker`)
  }, [])

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      dispatch(updatePageIndex(newPageIndex))
    },
    [dispatch],
  )

  const load = useCallback(async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setProjects(maybeBody.data)
    setIsLoading(false)
  }, [])

  const search = useCallback(
    debounce(async () => {
      if ($searchInput.current === null) {
        return
      }

      setIsLoading(true)

      const query = ($searchInput.current as any).value
      const urlParams = new URLSearchParams({
        query,
      })
      const path = `projects?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        setIsLoading(false)

        return
      }

      dispatch(updatePageIndex(0))

      setProjects(maybeBody.data)
      setIsLoading(false)
    }, 250),
    [dispatch],
  )

  const updateLockState = useCallback(async (id, isUnlocked) => {
    await api.patch(`projects/${id}`, { isUnlocked })

    await load()
  }, [])

  useEffect(() => {
    load()
  }, [])

  const columns = useMemo(() => {
    const newColumns = [
      ...BASE_COLUMNS,
      {
        action: updateLockState,
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
        action: goToLinker,
        Icon: Users,
        key: 'goToLinker',
        label: 'Gérer les mise en relation de ce projet',
        type: 'action',
      },
      {
        accent: 'secondary',
        action: goToEditor,
        Icon: Edit,
        key: 'goToEditor',
        label: 'Éditer ce projet',
        type: 'action',
      },
    ]

    if (user && user.role === Role.ADMINISTRATOR) {
      newColumns.push({
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer ce projet',
        type: 'action',
      })
    }

    return newColumns
  }, [confirmDeletion, goToEditor, user])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Projets</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={search} placeholder="Rechercher un projet" />

        <Table
          key={String(pageIndex)}
          columns={columns as any}
          data={projects}
          defaultSortedKey="name"
          isLoading={isLoading}
          onPageChange={handlePageChange}
          pageIndex={pageIndex}
        />
      </Card>

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeProjectDeletionModal} onConfirm={_delete} />
      )}
    </AdminBox>
  )
}
