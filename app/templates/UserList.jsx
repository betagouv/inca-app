import { Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import styled from 'styled-components'

import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`

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
    if (res.data === null) {
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
    <Box>
      <Title>Utilisateurs</Title>

      <Table columns={COLUMNS} data={users} />
    </Box>
  )
}
