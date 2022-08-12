import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import { useAppDispatch } from '@app/hooks/useAppDisptach'
import { useAppSelector } from '@app/hooks/useAppSelector'
import { Querier } from '@app/molecules/Querier'
import DeletionModal from '@app/organisms/DeletionModal'
import { setQuery, setPageIndex } from '@app/slices/adminOrganizationListSlice'
import { Role } from '@prisma/client'
import { Button, Card, Table } from '@singularity/core'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import type { RootState } from '@app/store'
import type { Organization, User } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'name',
    label: 'Dénomination',
  },
]

export default function AdminOrganizationListPage() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const { user } = useAuth<User>()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pageIndex = useAppSelector(({ adminOrganizationList }: RootState) => adminOrganizationList.pageIndex)
  const query = useAppSelector(({ adminOrganizationList }: RootState) => adminOrganizationList.query)

  const load = useCallback(async () => {
    const maybeBody = await api.get('organizations', { query })
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setOrganizations(maybeBody.data)
    setIsLoading(false)
  }, [api, query])

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    id => {
      const organization = R.find<Organization>(R.propEq('id', id))(organizations)
      if (!organization) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(organization.name)
      setHasDeletionModal(true)
    },
    [organizations],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`organizations/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [api, load, selectedId])

  const goToEditor = useCallback(
    id => {
      router.push(`/admin/organizations/${id}`)
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

  useEffect(() => {
    load()
  }, [load, query])

  const columns = useMemo(() => {
    const newColumns = [
      ...BASE_COLUMNS,
      {
        accent: 'secondary',
        action: goToEditor,
        Icon: Edit,
        key: 'goToEditor',
        label: 'Éditer cette organisation',
        type: 'action',
      },
    ]

    if (user && user.role === Role.ADMINISTRATOR) {
      newColumns.push({
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer cette organisation',
        type: 'action',
      })
    }

    return newColumns
  }, [confirmDeletion, goToEditor, user])

  return (
    <>
      <AdminHeader>
        <Title>Organisations</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter une organisation
        </Button>
      </AdminHeader>

      <Card>
        <Querier defaultQuery={query} onQuery={handleQuery} />

        <Table
          key={String(pageIndex)}
          columns={columns as any}
          data={organizations}
          defaultSortedKey="name"
          isLoading={isLoading}
          onPageChange={handlePageChange}
          pageIndex={pageIndex}
        />
      </Card>

      {hasDeletionModal && <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={_delete} />}
    </>
  )
}
