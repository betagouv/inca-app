import { Button, Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const COLUMNS = [
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
  {
    accent: 'secondary',

    // eslint-disable-next-line no-alert
    action: id => window.alert(`Edit ${id}`),

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

export default function UserList() {
  const api = useApi()
  const [users, setUsers] = useState([])
  const isMounted = useIsMounted()

  const loadUsers = async () => {
    const res = await api.get('users')
    if (res === null) {
      return
    }

    if (isMounted()) {
      setUsers(res.data)
    }
  }

  useEffect(() => {
    loadUsers()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Utilisateurs</Title>

        <Button size="small">Ajouter un utilisateur</Button>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={users} />
      </Card>
    </AdminBox>
  )
}
