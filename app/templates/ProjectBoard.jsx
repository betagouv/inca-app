import { Button, Tasker } from '@singularity-ui/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { PROJECT_CONTRIBUTOR_STATE } from '../../common/constants'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import ProjectCard from '../molecules/ProjectCard'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`

const StyledAdminHeader = styled(AdminHeader)`
  padding: 0 1rem;
`

const countSucessfulLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.SUCCESSFUL)), R.length)
const countValidatedLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.VALIDATED)), R.length)

export default function ProjectBoard() {
  const [projectCards, setProjectCards] = useState([[], [], [], []])
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const goToProjectEditor = id => {
    history.push(`/project/${id}`)
  }

  const goToProjectLinker = id => {
    history.push(`/project/linker/${id}`)
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  const getProjectCard = project => () => <ProjectCard onClick={() => goToProjectLinker(project.id)} {...project} />

  const loadProjects = async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const projectCards = maybeBody.data.reduce(
      (projectCards, project) => {
        const { contributors, isUnlocked } = project
        const Project = getProjectCard(project)

        if (isUnlocked) {
          return [[...projectCards[0]], [...projectCards[1]], [...projectCards[2]], [...projectCards[3], Project]]
        }

        const linksCount = R.length(contributors)
        const validatedOrSuccessfulLinksCount = countValidatedLinks(contributors) + countSucessfulLinks(contributors)

        if (validatedOrSuccessfulLinksCount > 0) {
          return [[...projectCards[0]], [...projectCards[1]], [...projectCards[2], Project], [...projectCards[3]]]
        }

        if (linksCount > 0) {
          return [[...projectCards[0]], [...projectCards[1], Project], [...projectCards[2]], [...projectCards[3]]]
        }

        return [[...projectCards[0], Project], [...projectCards[1]], [...projectCards[2]], [...projectCards[3]]]
      },
      [[], [], [], []],
    )

    if (isMounted()) {
      setProjectCards(projectCards)
    }
  }

  useEffect(() => {
    loadProjects()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <StyledAdminHeader>
        <Title>Suivi des projets</Title>

        <Button onClick={() => goToProjectEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </StyledAdminHeader>

      <Tasker
        data={[
          { label: 'Nouveaux', tasks: projectCards[0] },
          { label: 'Contributions proposées', tasks: projectCards[1] },
          { label: 'Mis en relation', tasks: projectCards[2] },
          { label: 'Débloqués', tasks: projectCards[3] },
        ]}
      />
    </Box>
  )
}
