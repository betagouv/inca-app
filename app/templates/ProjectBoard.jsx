import { Button, Tasker } from '@ivangabriele/singularity'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { PROJECT_CONTRIBUTOR_STATE } from '../../common/constants'
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

const countContactedLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.CONTACTED)), R.length)
const countRefusedLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.REFUSED)), R.length)
const countValidatedLinks = R.pipe(R.filter(R.propEq('state', PROJECT_CONTRIBUTOR_STATE.VALIDATED)), R.length)

const Project = () => <Tasker.Task>123</Tasker.Task>

export default function ProjectBoard() {
  const [projects, setProjects] = useState([])
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadProjects = async () => {
    const maybeBody = await api.get('projects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const data = maybeBody.data.reduce(
      (data, project) => {
        console.log(project)
        const { contributors } = project

        const linksCount = R.length(contributors)
        const contactedLinksCount = countContactedLinks(contributors)
        const refusedLinksCount = countRefusedLinks(contributors)
        const validatedLinksCount = countValidatedLinks(contributors)

        console.log(linksCount, contactedLinksCount, refusedLinksCount, validatedLinksCount)

        return data
      },
      [[], [], [], []],
    )

    console.log(data)

    if (isMounted()) {
      setProjects(maybeBody.data)
    }
  }

  useEffect(() => {
    loadProjects()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToProject = id => {
    history.push(`/project/${id}`)
  }

  return (
    <Box>
      <StyledAdminHeader>
        <Title>Suivi des projets</Title>

        <Button onClick={() => goToProject('new')} size="small">
          Ajouter un projet
        </Button>
      </StyledAdminHeader>

      <Tasker
        data={[
          { label: 'Nouveaux', tasks: [Project, Project] },
          { label: 'Contributions proposées', tasks: [Project] },
          { label: 'Mis en relation', tasks: [Project] },
          { label: 'Débloqués', tasks: [Project] },
        ]}
      />
    </Box>
  )
}
