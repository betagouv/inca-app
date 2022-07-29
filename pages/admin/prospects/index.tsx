import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import DeletionModal from '@app/organisms/DeletionModal'
import { updatePageIndex } from '@app/slices/adminProspectListSlice'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

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
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const dispatch = useDispatch()
  const router = useRouter()
  const pageIndex = useSelector(({ adminProspectList }: RootState) => adminProspectList.pageIndex)

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
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/prospects/${id}`)
  }, [])

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      dispatch(updatePageIndex(newPageIndex))
    },
    [dispatch],
  )

  const load = useCallback(async () => {
    const maybeBody = await api.get('prospects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setProspects(maybeBody.data)
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
      const path = `prospects?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        setIsLoading(false)

        return
      }

      dispatch(updatePageIndex(0))

      setProspects(maybeBody.data)
      setIsLoading(false)
    }, 250),
    [dispatch],
  )

  useEffect(() => {
    load()
  }, [])

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
    <AdminBox>
      <AdminHeader>
        <Title>Prospect·es</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un·e prospect·e
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={search} placeholder="Rechercher un·e prospect·e" />

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
    </AdminBox>
  )
}
