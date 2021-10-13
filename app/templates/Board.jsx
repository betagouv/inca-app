import { Button, Tasker } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`

const StyledAdminHeader = styled(AdminHeader)`
  padding: 0 1rem;
`

const Project = () => <Tasker.Task>123</Tasker.Task>

export default function Board() {
  const api = useApi()
  const [isSynchronizing, setIsSynchronizing] = useState(false)
  const isMounted = useIsMounted()

  const synchronizePipedrive = async () => {
    setIsSynchronizing(true)

    await api.get('pipedrive/synchronize')

    if (isMounted()) {
      setIsSynchronizing(false)
    }
  }

  useEffect(() => {
    synchronizePipedrive()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <StyledAdminHeader>
        <Title>Mise en relation {isSynchronizing ? `(Synchronizing...)` : null}</Title>

        <Button size="small">Ajouter un projet</Button>
      </StyledAdminHeader>

      <Tasker
        data={[
          { label: 'Nouveaux', tasks: [Project, Project] },
          { label: 'Proposés', tasks: [Project] },
          { label: 'Remplis', tasks: [Project] },
          { label: 'Complétés', tasks: [Project] },
        ]}
      />
    </Box>
  )
}
