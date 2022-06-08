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
    key: 'name',
    label: 'Dénomination',
  },
]

export default function OrganizationList() {
  const $searchInput = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [organizations, setOrganizations] = useState([])
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth()

  const loadOrganizations = async () => {
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
    loadOrganizations()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteOrganization = async id => {
    const maybeBody = await api.delete(`organization/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadOrganizations()
  }

  const goToOrganizationEditor = id => {
    navigate(`/organizations/${id}`)
  }

  const searchOrganizations = debounce(async () => {
    setIsLoading(true)

    const query = $searchInput.current.value
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
  }, 250)

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToOrganizationEditor,
      Icon: Edit,
      label: 'Éditer cette organisation',
      type: 'action',
    },
  ]

  if (user.role === USER_ROLE.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: deleteOrganization,
      Icon: Trash,
      label: 'Supprimer cette organisation',
      type: 'action',
    })
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Organisations</Title>

        <Button onClick={() => goToOrganizationEditor('new')} size="small">
          Ajouter une organisation
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={searchOrganizations} placeholder="Rechercher une organisation" />

        <Table columns={columns} data={organizations} defaultSortedKey="name" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
