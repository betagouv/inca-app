import { Button, Tasker } from '@ivangabriele/singularity'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'

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
  const history = useHistory()

  const goToProject = id => {
    history.push(`/project/${id}`)
  }

  return (
    <Box>
      <StyledAdminHeader>
        <Title>Mise en relation</Title>

        <Button onClick={() => goToProject('new')} size="small">
          Ajouter un projet
        </Button>
      </StyledAdminHeader>

      <Tasker
        data={[
          { label: 'Nouveaux', tasks: [Project, Project] },
          { label: 'Pris en charge', tasks: [Project] },
          { label: 'Débloqués', tasks: [Project] },
          { label: 'Terminés', tasks: [Project] },
        ]}
      />
    </Box>
  )
}
