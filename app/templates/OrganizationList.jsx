import { Card, Table } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const COLUMNS = [
  {
    isSortable: true,
    key: 'name',
    label: 'Dénomination',
  },
]

export default function OrganizationList() {
  const api = useApi()
  const [organizations, setOrganizations] = useState([])
  const isMounted = useIsMounted()

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

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Organisations</Title>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={organizations} defaultSortedKey="name" />
      </Card>
    </AdminBox>
  )
}
