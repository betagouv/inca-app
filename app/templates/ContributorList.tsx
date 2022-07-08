import { Temporal } from '@js-temporal/polyfill'
import { Role } from '@prisma/client'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useAuth } from 'nexauth/client'
import { useEffect, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import { useApi } from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

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

export default function ContributorList() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contributors, setContributors] = useState([])
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth()

  const loadContributors = async () => {
    const maybeBody = await api.get('contributors')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setContributors(maybeBody.data)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContributors()
  }, [])

  const deleteContributor = async id => {
    const maybeBody = await api.delete(`contributor/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadContributors()
  }

  const goToContributorEditor = id => {
    navigate(`/contributors/${id}`)
  }

  const searchContributors = debounce(async () => {
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
  }, 250)

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToContributorEditor,
      Icon: Edit,
      key: 'goToContributorEditor',
      label: 'Éditer ce·tte contributeur·rice',
      type: 'action',
    },
  ]

  if (user && (user as any).role === Role.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: deleteContributor,
      Icon: Trash,
      key: 'deleteContributor',
      label: 'Supprimer ce·tte contributeur·rice',
      type: 'action',
    })
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Contributeur·rices</Title>

        <Button onClick={() => goToContributorEditor('new')} size="small">
          Ajouter un·e contributeur·rice
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={searchContributors} placeholder="Rechercher un·e contributeur·rice" />

        <Table columns={columns as any} data={contributors} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
