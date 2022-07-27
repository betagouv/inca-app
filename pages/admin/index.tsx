import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import ProjectCard from '@app/molecules/ProjectCard'
import { PROJECT_CONTRIBUTOR_STATE } from '@common/constants'
import { Button, Tasker } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useEffect, useState } from 'react'

const countSucessfulLinks: any = R.pipe(
  R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.SUCCESSFUL)) as any,
  R.length,
)
const countValidatedLinks: any = R.pipe(
  R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.VALIDATED)) as any,
  R.length,
)

export default function AdminProjectBoardPage() {
  const [projectCards, setProjectCards] = useState([[], [], [], []])
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()

  const goToProjectEditor = id => {
    router.push(`/admin/projects/${id}`)
  }

  const goToProjectLinker = id => {
    router.push(`/admin/projects/${id}/linker`)
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
          { label: 'Contributions proposées', tasks: projectCards[1] },
          { label: 'Mis en relation', tasks: projectCards[2] },
          { label: 'Débloqués', tasks: projectCards[3] },
        ]}
      />
    </AdminBox>
  )
}
