import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import { useAppDispatch } from '@app/hooks/useAppDisptach'
import { useAppSelector } from '@app/hooks/useAppSelector'
import { Querier } from '@app/molecules/Querier'
import DeletionModal from '@app/organisms/DeletionModal'
import { setQuery, setPageIndex } from '@app/slices/adminProjectListSlice'
import { Temporal } from '@js-temporal/polyfill'
import { Project, Role } from '@prisma/client'
import { Button, Card, Table } from '@singularity/core'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Users, Trash, Lock, Unlock, Eye, EyeOff } from 'react-feather'

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
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const { user } = useAuth<User>()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pageIndex = useAppSelector(({ adminProjectList }: RootState) => adminProjectList.pageIndex)
  const query = useAppSelector(({ adminProjectList }: RootState) => adminProjectList.query)

  const load = useCallback(async () => {
    const maybeBody = await api.get('projects', { query })
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setProjects(maybeBody.data)
    setIsLoading(false)
  }, [api, query])

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
  }, [api, load, selectedId])

  const goToEditor = useCallback(
    id => {
      router.push(`/admin/projects/${id}`)
    },
    [router],
  )

  const goToLinker = useCallback(
    id => {
      router.push(`/admin/projects/${id}/linker`)
    },
    [router],
  )

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      dispatch(setPageIndex(newPageIndex))
    },
    [dispatch],
  )

  const handleQuery = useCallback(
    (newQuery: string) => {
      dispatch(setPageIndex(0))
      dispatch(setQuery(newQuery))
    },
    [dispatch],
  )

  const updateArchiveState = useCallback(
    async (id, isArchived) => {
      await api.patch(`projects/${id}`, { isArchived })

      await load()
    },
    [api, load],
  )

  const updateLockState = useCallback(
    async (id, isUnlocked) => {
      await api.patch(`projects/${id}`, { isUnlocked })

      await load()
    },
    [api, load],
  )

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(() => {
    const newColumns = [
      ...BASE_COLUMNS,
      {
        accent: 'secondary',
        action: goToLinker,
        Icon: Users,
        key: 'goToLinker',
        label: 'Gérer les mise en relation de ce projet',
        type: 'action',
        withTooltip: true,
      },
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
        action: updateArchiveState,
        IconOff: Eye,
        IconOn: EyeOff,
        key: 'isArchived',
        label: 'Projet archivé',
        labelOff: 'Projet actif',
        labelOn: 'Projet archivé',
        type: 'boolean',
        withTooltip: true,
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
  }, [confirmDeletion, goToEditor, goToLinker, updateArchiveState, updateLockState, user])

  return (
    <>
      <AdminHeader>
        <Title>{`Projets (${projects.length})`}</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <Card>
        <Querier defaultQuery={query} onQuery={handleQuery} />

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
    </>
  )
}
