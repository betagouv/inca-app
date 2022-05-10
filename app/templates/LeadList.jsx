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

export default function LeadList() {
  const $searchInput = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth()

  const loadLeads = async () => {
    const maybeBody = await api.get('leads')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setLeads(maybeBody.data)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteLead = async id => {
    const maybeBody = await api.delete(`lead/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadLeads()
  }

  const goToLeadEditor = id => {
    navigate(`/lead/${id}`)
  }

  const searchLeads = debounce(async () => {
    setIsLoading(true)

    const query = $searchInput.current.value
    const urlParams = new URLSearchParams({
      query,
    })
    const path = `leads?${urlParams}`

    const maybeBody = await api.get(path)
    if (maybeBody === null || maybeBody.hasError) {
      if (isMounted()) {
        setIsLoading(false)
      }

      return
    }

    if (isMounted()) {
      setLeads(maybeBody.data)
      setIsLoading(false)
    }
  }, 250)

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToLeadEditor,
      Icon: Edit,
      label: 'Éditer ce·tte porteur·se',
      type: 'action',
    },
  ]

  if (user.role === USER_ROLE.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: deleteLead,
      Icon: Trash,
      label: 'Supprimer ce·tte porteur·se',
      type: 'action',
    })
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Porteur·ses</Title>

        <Button onClick={() => goToLeadEditor('new')} size="small">
          Ajouter un·e porteur·se
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={searchLeads} placeholder="Rechercher un·e porteur·se" />

        <Table columns={columns} data={leads} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
