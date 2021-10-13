import { Button, Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useHistory } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const BASE_COLUMNS = [
  {
    key: 'firstName',
    label: 'Prénom',
  },
  {
    key: 'lastName',
    label: 'Nom',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'role',
    label: 'Rôle',
  },
]

export default function UserList() {
  const api = useApi()
  const [users, setUsers] = useState([])
  const isMounted = useIsMounted()
  const history = useHistory()

  const loadUsers = async () => {
    const maybeBody = await api.get('users')
    if (maybeBody === null) {
      return
    }

    if (isMounted()) {
      setUsers(maybeBody.data)
    }
  }

  useEffect(() => {
    loadUsers()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToUser = id => {
    history.push(`/user/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',

      // eslint-disable-next-line no-alert
      action: goToUser,

      Icon: () => <Edit />,
      label: 'Edit user',
      type: 'action',
    },
    {
      accent: 'danger',

      // eslint-disable-next-line no-alert
      action: id => window.alert(`Delete ${id}`),

      Icon: Trash,
      label: 'Delete user',
      type: 'action',
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Utilisateurs</Title>

        <Button size="small">Ajouter un utilisateur</Button>
      </AdminHeader>

      <Card>
        <Table columns={columns} data={users} />
      </Card>
    </AdminBox>
  )
}
