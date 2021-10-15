import { Button, Table, Textarea } from '@ivangabriele/singularity'
import debounce from 'lodash.debounce'
import { useEffect, useState } from 'react'
import { Square } from 'react-feather'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

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

const NoteTextarea = styled(Textarea)`
  .Textarea {
    min-height: 20rem;
  }
`

export default function ProjectLinker() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [contributors, setContributors] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const isLoading = project === null || contributors === null

  const loadProject = async () => {
    const maybeBody = await api.get(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contributors = maybeBody.data.contributors.map(({ contributor }) => contributor)

    if (isMounted()) {
      setProject(maybeBody.data)
      setContributors(contributors)
    }
  }

  useEffect(() => {
    loadProject()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToProjectEditor = () => {
    history.push(`/project/${id}`)
  }

  const updateNote = debounce(async event => {
    await api.patch(`project/${id}`, { note: event.target.value })
  }, 250)

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',

      action: () => undefined,

      Icon: Square,
      label: 'Edit project',
      type: 'action',
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
        <Table columns={columns} data={contributors} />
      </Card>

      <Card>
        <Subtitle>Notes</Subtitle>
        <NoteTextarea defaultValue={project.note} name="note" onChange={updateNote} />
      </Card>
    </AdminBox>
  )
}
