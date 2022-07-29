import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import DeletionModal from '@app/organisms/DeletionModal'
import { updatePageIndex } from '@app/slices/adminOrganizationListSlice'
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
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const api = useApi()
  const { user } = useAuth<User>()
  const dispatch = useDispatch()
  const router = useRouter()
  const pageIndex = useSelector(({ adminOrganizationList }: RootState) => adminOrganizationList.pageIndex)

  const load = async () => {
    const maybeBody = await api.get('organizations')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setOrganizations(maybeBody.data)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/organizations/${id}`)
  }, [])

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      dispatch(updatePageIndex(newPageIndex))
    },
    [dispatch],
  )

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
      const path = `organizations?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        setIsLoading(false)

        return
      }

      setOrganizations(maybeBody.data)
      setIsLoading(false)
    }, 250),
    [],
  )

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
    <AdminBox>
      <AdminHeader>
        <Title>Organisations</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter une organisation
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={search} placeholder="Rechercher une organisation" />

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
    </AdminBox>
  )
}
