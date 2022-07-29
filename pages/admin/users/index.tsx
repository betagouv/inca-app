import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import { Card, Table } from '@singularity/core'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Edit2, UserCheck, UserX } from 'react-feather'

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
    key: 'email',
    label: 'Email',
  },
  {
    isSortable: true,
    key: 'role',
    label: 'Rôle',
  },
  {
    IconOff: UserX,
    IconOn: UserCheck,
    key: 'isActive',
    label: 'Compte actif',
    labelOff: 'Compte inactif',
    labelOn: 'Compte actif',
    type: 'boolean',
    withTooltip: true,
  },
]

export default function UserListPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const api = useApi()
  const router = useRouter()

  const goToEditor = useCallback(id => {
    router.push(`/admin/users/${id}`)
  }, [])

  const load = useCallback(async () => {
    const maybeBody = await api.get('users')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setUsers(maybeBody.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [])

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToEditor as any,
      Icon: Edit2,
      key: 'goToEditor',
      label: 'Éditer ce·tte utilisateur·rice',
      type: 'action',
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Utilisateur·rices</Title>
      </AdminHeader>

      <Card>
        <Table columns={columns as any} data={users} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
