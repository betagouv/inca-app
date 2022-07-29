import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import DeletionModal from '@app/organisms/DeletionModal'
import { updatePageIndex } from '@app/slices/adminLeadListSlice'
import { Role } from '@prisma/client'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '@app/store'
import type { Lead, User } from '@prisma/client'
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
    key: 'organization.name',
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

export default function AdminLeadListPage() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const { user } = useAuth<User>()
  const dispatch = useDispatch()
  const router = useRouter()
  const pageIndex = useSelector(({ adminLeadList }: RootState) => adminLeadList.pageIndex)

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    id => {
      const lead = R.find<Lead>(R.propEq('id', id))(leads)
      if (!lead) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(`${lead.firstName} ${lead.lastName}`)
      setHasDeletionModal(true)
    },
    [leads],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`leads/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/leads/${id}`)
  }, [])

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      dispatch(updatePageIndex(newPageIndex))
    },
    [dispatch],
  )

  const load = useCallback(async () => {
    const maybeBody = await api.get('leads')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setLeads(maybeBody.data)
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
      const path = `leads?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        setIsLoading(false)

        return
      }

      setLeads(maybeBody.data)
      setIsLoading(false)
    }, 250),
    [],
  )

  useEffect(() => {
    load()
  }, [])

  const columns = useMemo(() => {
    const newColumns = [
      ...BASE_COLUMNS,
      {
        accent: 'secondary',
        action: goToEditor,
        Icon: Edit,
        key: 'goToEditor',
        label: 'Éditer ce·tte porteur·se',
        type: 'action',
      },
    ]

    if (user && (user as any).role === Role.ADMINISTRATOR) {
      newColumns.push({
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer ce·tte porteur·se',
        type: 'action',
      })
    }

    return newColumns
  }, [confirmDeletion, goToEditor, user])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Porteur·ses</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un·e porteur·se
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={search} placeholder="Rechercher un·e porteur·se" />

        <Table
          key={String(pageIndex)}
          columns={columns as any}
          data={leads}
          defaultSortedKey="lastName"
          isLoading={isLoading}
          onPageChange={handlePageChange}
          pageIndex={pageIndex}
        />
      </Card>

      {hasDeletionModal && <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={_delete} />}
    </AdminBox>
  )
}
