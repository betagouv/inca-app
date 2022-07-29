import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import DeletionModal from '@app/organisms/DeletionModal'
import { Temporal } from '@js-temporal/polyfill'
import { Role } from '@prisma/client'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useAuth } from 'nexauth/client'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import type { Contributor, User } from '@prisma/client'

/** @type {import('@singularity/core').TableColumnProps[]} */
const BASE_COLUMNS = [
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
  {
    isSortable: true,
    key: 'updatedAt',
    label: 'Mise à jour',
    transform: ({ updatedAt }) => Temporal.Instant.from(updatedAt).toLocaleString('fr-FR'),
  },
]

export default function AdminContributorListPage() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth<User>()

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    id => {
      const contributor = R.find<Contributor>(R.propEq('id', id))(contributors)
      if (!contributor) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(`${contributor.firstName} ${contributor.lastName}`)
      setHasDeletionModal(true)
    },
    [contributors],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`contributors/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/contributors/${id}`)
  }, [])

  const load = useCallback(async () => {
    const maybeBody = await api.get('contributors')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setContributors(maybeBody.data)
      setIsLoading(false)
    }
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
      const path = `contributors?${urlParams}`

      const maybeBody = await api.get(path)
      if (maybeBody === null || maybeBody.hasError) {
        if (isMounted()) {
          setIsLoading(false)
        }

        return
      }

      if (isMounted()) {
        setContributors(maybeBody.data)
        setIsLoading(false)
      }
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
        label: 'Éditer ce·tte contributeur·rice',
        type: 'action',
      },
    ]

    if (user && user.role === Role.ADMINISTRATOR) {
      newColumns.push({
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer ce·tte contributeur·rice',
        type: 'action',
      })
    }

    return newColumns
  }, [confirmDeletion, goToEditor, user])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Contributeur·rices</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter un·e contributeur·rice
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={search} placeholder="Rechercher un·e contributeur·rice" />

        <Table columns={columns as any} data={contributors} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={_delete} />}
    </AdminBox>
  )
}