import { Temporal } from '@js-temporal/polyfill'
import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useEffect, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import { USER_ROLE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import useIsMounted from '../hooks/useIsMounted'

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setIsLoading(true)

    const query = $searchInput.current.value
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
      label: 'Éditer ce·tte contributeur·rice',
      type: 'action',
    },
  ]

  if (user.role === USER_ROLE.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: deleteContributor,
      Icon: Trash,
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

        <Table columns={columns} data={contributors} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
