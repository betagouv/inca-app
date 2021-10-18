import { Button, Table, Textarea } from '@ivangabriele/singularity'
import debounce from 'lodash.debounce'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { Send, UserCheck, UserX } from 'react-feather'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { PROJECT_CONTRIBUTOR_STATE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Card from '../atoms/Card'
import Subtitle from '../atoms/Subtitle'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'

const BASE_COLUMNS = [
  {
    key: 'firstName',
    label: 'Prénom',
  },
  {
    key: 'lastName',
    label: 'Nom',
  },
]

const ToggleIconOff = styled.div`
  color: ${p => p.theme.color.secondary.default};
  opacity: 0.65;
`
const ToggleIconOn = styled.div`
  color: ${p => p.theme.color.primary.default};
`

const NoteTextarea = styled(Textarea)`
  .Textarea {
    min-height: 20rem;
  }
`

export default function ProjectLinker() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [contributorLinks, setContributorLinks] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const isLoading = project === null || contributorLinks === null

  const loadProject = async () => {
    const maybeBody = await api.get(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contributorLinks = R.pipe(
      R.map(({ contributor, state }) => ({
        ...contributor,
        isContacted: state === PROJECT_CONTRIBUTOR_STATE.CONTACTED,
        isRefused: state === PROJECT_CONTRIBUTOR_STATE.REFUSED,
        isValidated: state === PROJECT_CONTRIBUTOR_STATE.VALIDATED,
        state,
      })),
      R.sortBy(R.prop('lastName')),
    )(maybeBody.data.contributors)

    if (isMounted()) {
      setProject({ ...maybeBody.data })
      setContributorLinks([...contributorLinks])
    }
  }

  useEffect(() => {
    loadProject()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToProjectEditor = () => {
    history.push(`/project/${id}`)
  }

  const updateProjectNote = debounce(async event => {
    await api.patch(`project/${id}`, { note: event.target.value })
  }, 250)

  const updateProjectContributorState = async (contributorId, state) => {
    const contributorLink = R.find(R.propEq('id', contributorId))(contributorLinks)
    const newState = state !== contributorLink.state ? state : PROJECT_CONTRIBUTOR_STATE.ASSIGNED

    await api.patch(`project/${id}/${contributorId}`, {
      state: newState,
    })

    await loadProject()
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      action: id => updateProjectContributorState(id, PROJECT_CONTRIBUTOR_STATE.CONTACTED),
      IconOff: () => <ToggleIconOff as={Send} />,
      IconOn: () => <ToggleIconOn as={Send} />,
      key: 'isContacted',
      labelOff: 'Marquer comme contacté·e',
      labelOn: 'Annuler',
      type: 'toggle',
    },
    {
      action: id => updateProjectContributorState(id, PROJECT_CONTRIBUTOR_STATE.REFUSED),
      IconOff: () => <ToggleIconOff as={UserX} />,
      IconOn: () => <ToggleIconOn as={UserX} />,
      key: 'isRefused',
      labelOff: 'Marquer comme refusé·e',
      labelOn: 'Annuler',
      type: 'toggle',
    },
    {
      action: id => updateProjectContributorState(id, PROJECT_CONTRIBUTOR_STATE.VALIDATED),
      IconOff: () => <ToggleIconOff as={UserCheck} />,
      IconOn: () => <ToggleIconOn as={UserCheck} />,
      key: 'isValidated',
      labelOff: 'Marquer comme accepté·e',
      labelOn: 'Annuler',
      type: 'toggle',
    },
  ]

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{project.name}</Title>

        <Button onClick={goToProjectEditor}>Éditer le projet</Button>
      </AdminHeader>

      <Card>
        <Subtitle>Contributeur·rices</Subtitle>
        <Table columns={columns} data={contributorLinks} />
      </Card>

      <Card>
        <Subtitle>Notes</Subtitle>
        <NoteTextarea defaultValue={project.note} name="note" onChange={updateProjectNote} />
      </Card>
    </AdminBox>
  )
}
