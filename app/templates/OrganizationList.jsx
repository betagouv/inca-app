import { Card, Table } from '@singularity-ui/core'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useHistory } from 'react-router-dom'

import { ROLE } from '../../common/constants'
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
  const [organizations, setOrganizations] = useState([])
  const history = useHistory()
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
    history.push(`/organization/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToOrganizationEditor,
      Icon: () => <Edit />,
      label: 'Éditer cette organisation',
      type: 'action',
    },
  ]

  if (user.role === ROLE.ADMINISTRATOR) {
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
      </AdminHeader>

      <Card>
        <Table columns={columns} data={organizations} defaultSortedKey="name" />
      </Card>
    </AdminBox>
  )
}
