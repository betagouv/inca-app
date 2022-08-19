import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import ProjectCard from '@app/molecules/ProjectCard'
import { PROJECT_CONTRIBUTOR_STATE } from '@common/constants'
import { Button, Tasker } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledTasker = styled(Tasker)`
  flex-grow: 1;

  .Label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > div > div {
    > div:nth-child(2) {
      margin: 1rem 0 0.5rem;
      overflow-y: scroll;
      padding-left: 1px;
      padding-right: 1rem;

      ::-webkit-scrollbar {
        -webkit-appearance: none;
      }
      ::-webkit-scrollbar:vertical {
        width: 0.5rem;
      }
      ::-webkit-scrollbar-thumb {
        border: 0;
        background-color: ${p => p.theme.color.secondary.default};
      }
      ::-webkit-scrollbar-track {
        background-color: ${p => p.theme.color.secondary.background};
      }

      > div:first-child {
        margin-top: 0;
      }
      > div:last-child {
        margin-bottom: 0;
      }
    }
  }
`

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
  const api = useApi()

  const goToProjectEditor = useCallback(
    id => {
      router.push(`/admin/projects/${id}`)
    },
    [router],
  )

  const goToProjectLinker = useCallback(
    id => {
      router.push(`/admin/projects/${id}/linker`)
    },
    [router],
  )

  // eslint-disable-next-line react/jsx-props-no-spreading
  const getProjectCard = useCallback(
    project => () => <ProjectCard onClick={() => goToProjectLinker(project.id)} {...project} />,
    [goToProjectLinker],
  )

  const load = useCallback(async () => {
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

    setProjectCards(newProjectCards)
  }, [api, getProjectCard])

  useEffect(() => {
    load()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <AdminHeader>
        <Title>Suivi des projets</Title>

        <Button onClick={() => goToProjectEditor('new')} size="small">
          Ajouter un projet
        </Button>
      </AdminHeader>

      <StyledTasker
        data={[
          { label: 'Nouveaux', tasks: projectCards[0] },
          { label: 'Contrib. proposées', tasks: projectCards[1] },
          { label: 'Mis en relation', tasks: projectCards[2] },
          { label: 'Débloqués', tasks: projectCards[3] },
        ]}
        style={{
          display: 'flex',
        }}
      />
    </>
  )
}
