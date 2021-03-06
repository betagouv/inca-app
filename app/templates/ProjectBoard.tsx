import { Button, Tasker } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PROJECT_CONTRIBUTOR_STATE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import { useApi } from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import ProjectCard from '../molecules/ProjectCard'

const countSucessfulLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.SUCCESSFUL)), R.length)
const countValidatedLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.VALIDATED)), R.length)

export default function ProjectBoard() {
  const [projectCards, setProjectCards] = useState([[], [], [], []])
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const goToProjectEditor = id => {
    navigate(`/projects/${id}`, {
      state: {
        fromProjectBoard: true,
      },
    })
  }

  const goToProjectLinker = id => {
    navigate(`/projects/linker/${id}`)
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  const getProjectCard = project => () => <ProjectCard onClick={() => goToProjectLinker(project.id)} {...project} />

  const loadProjects = async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newProjectCards = maybeBody.data.reduce(
      (projectCardsStack, project) => {
        const { contributors, isUnlocked } = project
        const Project = getProjectCard(project)

        if (isUnlocked) {
          return [
            [...projectCardsStack[0]],
            [...projectCardsStack[1]],
            [...projectCardsStack[2]],
            [...projectCardsStack[3], Project],
          ]
        }

        const linksCount = R.length(contributors)
        const validatedOrSuccessfulLinksCount = countValidatedLinks(contributors) + countSucessfulLinks(contributors)

        if (validatedOrSuccessfulLinksCount > 0) {
          return [
            [...projectCardsStack[0]],
            [...projectCardsStack[1]],
            [...projectCardsStack[2], Project],
            [...projectCardsStack[3]],
          ]
        }

        if (linksCount > 0) {
          return [
            [...projectCardsStack[0]],
            [...projectCardsStack[1], Project],
            [...projectCardsStack[2]],
            [...projectCardsStack[3]],
          ]
        }

        return [
          [...projectCardsStack[0], Project],
          [...projectCardsStack[1]],
          [...projectCardsStack[2]],
          [...projectCardsStack[3]],
        ]
      },
      [[], [], [], []],
    )

    if (isMounted()) {
      setProjectCards(newProjectCards)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Suivi des projets</Title>

        <Button onClick={() => goToProjectEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <Tasker
        data={[
          { label: 'Nouveaux', tasks: projectCards[0] },
          { label: 'Contributions propos??es', tasks: projectCards[1] },
          { label: 'Mis en relation', tasks: projectCards[2] },
          { label: 'D??bloqu??s', tasks: projectCards[3] },
        ]}
      />
    </AdminBox>
  )
}
