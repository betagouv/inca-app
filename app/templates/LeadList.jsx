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

export default function LeadList() {
  const api = useApi()
  const [leads, setLeads] = useState([])
  const isMounted = useIsMounted()

  const loadLeads = async () => {
    const res = await api.get('leads')
    if (res === null) {
      return
    }

    if (isMounted()) {
      setLeads(res.data)
    }
  }

  useEffect(() => {
    loadLeads()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Porteurs</Title>
      </AdminHeader>

      <Card>
        <Table columns={COLUMNS} data={leads} />
      </Card>
    </AdminBox>
  )
}
