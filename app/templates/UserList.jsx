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
    key: 'isActive',
    label: '',
    type: 'boolean',
  },
]

export default function UserList() {
  const [users, setUsers] = useState([])
  const history = useHistory()
  const api = useApi()
  const isMounted = useIsMounted()

  const loadUsers = async () => {
    const maybeBody = await api.get('users')
    if (maybeBody === null || maybeBody.hasError) {
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

  const goToUserEditor = id => {
    history.push(`/user/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToUserEditor,
      Icon: () => <Edit />,
      label: 'Éditer ce·tte utilisateur·rice',
      type: 'action',
    },
    {
      accent: 'danger',
      action: () => undefined,
      Icon: Trash,
      label: 'Supprimer ce·tte utilisateur·rice',
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
        <Table columns={columns} data={users} defaultSortedKey="lastName" />
      </Card>
    </AdminBox>
  )
}
