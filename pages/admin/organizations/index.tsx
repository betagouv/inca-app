import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import DeletionModal from '@app/organisms/DeletionModal'
import { Organization, Role, User } from '@prisma/client'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'

/** @type {import('@singularity/core').TableColumnProps[]} */
const BASE_COLUMNS = [
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
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth<User>()

  const load = async () => {
    const maybeBody = await api.get('organizations')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setOrganizations(maybeBody.data)
      setIsLoading(false)
    }
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

    const maybeBody = await api.delete(`organization/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/organizations/${id}`)
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
      const path = `organizations?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        if (isMounted()) {
          setIsLoading(false)
        }

        return
      }

      if (isMounted()) {
        setOrganizations(maybeBody.data)
        setIsLoading(false)
      }
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

        <Table columns={columns as any} data={organizations} defaultSortedKey="name" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={_delete} />}
    </AdminBox>
  )
}
