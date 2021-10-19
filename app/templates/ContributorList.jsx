import { Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import { Trash } from 'react-feather'

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
    key: 'phone',
    label: 'Téléphone',
  },
]

export default function ContributorList() {
  const [contributors, setContributors] = useState([])
  const isMounted = useIsMounted()
  const api = useApi()
  const { user } = useAuth()

  const loadContributors = async () => {
    const maybeBody = await api.get('contributors')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setContributors(maybeBody.data)
    }
  }

  useEffect(() => {
    loadContributors()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteContributor = async id => {
    const maybeBody = await api.delete(`contributor/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadContributors()
  }

  const columns = [...BASE_COLUMNS]

  if (user.role === ROLE.ADMINISTRATOR) {
    columns.unshift({
      isSortable: true,
      key: 'pipedriveId',
      label: 'PID',
    })

    columns.push(
      {
        key: 'projects.length',
        label: '',
      },
      {
        accent: 'danger',

        action: deleteContributor,

        Icon: Trash,
        label: 'Delete project',
        type: 'action',
      },
    )
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Contributeur·rices</Title>
      </AdminHeader>

      <Card>
        <Table columns={columns} data={contributors} defaultSortedKey="lastName" />
      </Card>
    </AdminBox>
  )
}
