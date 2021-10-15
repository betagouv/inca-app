import { Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'

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
    key: 'phone',
    label: 'Téléphone',
  },
]

export default function ContributorList() {
  const api = useApi()
  const [contributors, setContributors] = useState([])
  const isMounted = useIsMounted()

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

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Contributeur·rices</Title>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={contributors} />
      </Card>
    </AdminBox>
  )
}
