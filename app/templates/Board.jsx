import { Tasker } from '@ivangabriele/singularity'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import AtomTitle from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`

const Title = styled(AtomTitle)`
  padding-left: 1rem;
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
      <Title>Mise en relation {isSynchronizing ? `(Synchronizing...)` : null}</Title>

      <Tasker
        data={[
          { label: 'Upcoming', tasks: [Project, Project] },
          { label: 'In Progress', tasks: [Project] },
          { label: 'Completed', tasks: [Project] },
        ]}
      />
    </Box>
  )
}
