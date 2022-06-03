import { Button, Card, Table } from '@singularity/core'
import { useEffect, useState } from 'react'
import { Edit2, UserCheck, UserX } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
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

export default function UserList() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const api = useApi()
  const isMounted = useIsMounted()

  const loadUsers = async () => {
    const maybeBody = await api.get('users')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setUsers(maybeBody.data)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToUserEditor = id => {
    navigate(`/users/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToUserEditor,
      Icon: Edit2,
      label: 'Éditer ce·tte utilisateur·rice',
      type: 'action',
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Utilisateur·rices</Title>

        <Button onClick={() => goToUserEditor('new')} size="small">
          Ajouter un utilisateur
        </Button>
      </AdminHeader>

      <Card>
        <Table columns={columns} data={users} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>
    </AdminBox>
  )
}
