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
    key: 'name',
    label: 'Dénomination',
  },
]

export default function OrganizationList() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
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
  }, 250)

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToOrganizationEditor,
      Icon: Edit,
      key: 'goToOrganizationEditor',
      label: 'Éditer cette organisation',
      type: 'action',
    },
  ]

  if (user && (user as any).role === Role.ADMINISTRATOR) {
    columns.push({
      accent: 'danger',
      action: deleteOrganization,
      Icon: Trash,
      key: 'deleteOrganization',
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

        <Table columns={columns as any} data={organizations} defaultSortedKey="name" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
