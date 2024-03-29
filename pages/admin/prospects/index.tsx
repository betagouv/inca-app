import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import { useAppDispatch } from '@app/hooks/useAppDisptach'
import { useAppSelector } from '@app/hooks/useAppSelector'
import { Querier } from '@app/molecules/Querier'
import DeletionModal from '@app/organisms/DeletionModal'
import { setQuery, setPageIndex } from '@app/slices/adminProspectListSlice'
import { Button, Card, Table } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import type { RootState } from '@app/store'
import type { Prospect } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'firstName',
    label: 'Prénom',
  },
  {
    isSortable: true,
    key: 'lastName',
    label: 'Nom',
  },
  {
    isSortable: true,
    key: 'organization',
    label: 'Organisation',
  },
  {
    isSortable: true,
    key: 'email',
    label: 'Email',
  },
  {
    isSortable: true,
    key: 'phone',
    label: 'Téléphone',
  },
  {
    isSortable: true,
    key: 'contactCategory.label',
    label: 'Catégorie',
  },
]

export default function AdminProspectListPage() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pageIndex = useAppSelector(({ adminProspectList }: RootState) => adminProspectList.pageIndex)
  const query = useAppSelector(({ adminProspectList }: RootState) => adminProspectList.query)

  const load = useCallback(async () => {
    const maybeBody = await api.get('prospects', { query })
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setProspects(maybeBody.data)
    setIsLoading(false)
  }, [api, query])

  const closeProspectDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    async id => {
      const prospect = R.find<Prospect>(R.propEq('id', id))(prospects)
      if (!prospect) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(`${prospect.firstName} ${prospect.lastName}`)
      setHasDeletionModal(true)
    },
    [prospects],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`prospects/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [api, load, selectedId])

  const goToEditor = useCallback(
    id => {
      router.push(`/admin/prospects/${id}`)
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

  const columns = useMemo(
    () => [
      ...BASE_COLUMNS,
      {
        accent: 'secondary',
        action: goToEditor,
        Icon: Edit,
        key: 'goToEditor',
        label: 'Éditer ce·tte prospect·e',
        type: 'action',
      },
      {
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer ce·tte prospect·e',
        type: 'action',
      },
    ],
    [confirmDeletion, goToEditor],
  )

  return (
    <>
      <AdminHeader>
        <Title>{`Prospect·es (${prospects.length})`}</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un·e prospect·e
        </Button>
      </AdminHeader>

      <Card>
        <Querier defaultQuery={query} onQuery={handleQuery} />

        <Table
          key={String(pageIndex)}
          columns={columns as any}
          data={prospects}
          defaultSortedKey="lastName"
          isLoading={isLoading}
          onPageChange={handlePageChange}
          pageIndex={pageIndex}
        />
      </Card>

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeProspectDeletionModal} onConfirm={_delete} />
      )}
    </>
  )
}
