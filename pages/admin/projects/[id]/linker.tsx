import { prisma } from '@api/libs/prisma'
import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Card from '@app/atoms/Card'
import Subtitle from '@app/atoms/Subtitle'
import Title from '@app/atoms/Title'
import { getContributorLinksFromProject } from '@app/helpers/getContributorLinksFromProject'
import getRandomKey from '@app/helpers/getRandomKey'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import { PROJECT_CONTRIBUTOR_STATE } from '@common/constants'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Button, Table, Textarea } from '@singularity/core'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useState } from 'react'
import { Send, Star, UserCheck, UserX } from 'react-feather'
import styled from 'styled-components'
import superjson from 'superjson'

import type { FullProject } from '@common/types'
import type { TableColumnProps } from '@singularity/core'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'firstName',
    label: 'Prénom',
  },
  {
    isSortable: true,
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

type AdminProjectLinkerPageProps = {
  projectAsSuperJson: string
}
export default function AdminProjectLinkerPage({ projectAsSuperJson }: AdminProjectLinkerPageProps) {
  const project = superjson.parse<FullProject>(projectAsSuperJson)

  const [contributorLinks, setContributorLinks] = useState(getContributorLinksFromProject(project))
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()

  const id = getIdFromRequest(router)

  const load = async () => {
    const maybeBody = await api.get(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newContributorLinks = getContributorLinksFromProject(maybeBody.data)

    if (isMounted()) {
      setContributorLinks([...newContributorLinks])
    }
  }

  const goToEditor = () => {
    router.push(`/admin/projects/${id}`)
  }

  const updateProjectNote = debounce(async event => {
    await api.patch(`project/${id}`, { note: event.target.value })
  }, 250)

  const updateProjectContributorState = async (contributorId, state) => {
    const contributorLink: any = R.find(R.propEq('id', contributorId))(contributorLinks)
    const newState = state !== contributorLink.state ? state : PROJECT_CONTRIBUTOR_STATE.ASSIGNED

    await api.patch(`project/${id}/${contributorId}`, {
      state: newState,
    })

    await load()
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      action: _id => updateProjectContributorState(_id, PROJECT_CONTRIBUTOR_STATE.CONTACTED),
      IconOff: () => <ToggleIconOff as={Send} />,
      IconOn: () => <ToggleIconOn as={Send} />,
      key: 'isContacted',
      label: 'Statut: Contacté·e',
      labelOff: 'Marquer comme contacté·e',
      labelOn: 'Annuler',
      type: 'boolean',
      withTooltip: true,
    },
    {
      action: _id => updateProjectContributorState(_id, PROJECT_CONTRIBUTOR_STATE.REFUSED),
      IconOff: () => <ToggleIconOff as={UserX} />,
      IconOn: () => <ToggleIconOn as={UserX} />,
      key: 'isRefused',
      label: 'Statut: Refusé·e',
      labelOff: 'Marquer comme refusé·e',
      labelOn: 'Annuler',
      type: 'boolean',
      withTooltip: true,
    },
    {
      action: _id => updateProjectContributorState(_id, PROJECT_CONTRIBUTOR_STATE.VALIDATED),
      IconOff: () => <ToggleIconOff as={UserCheck} />,
      IconOn: () => <ToggleIconOn as={UserCheck} />,
      key: 'isValidated',
      label: 'Statut: Accepté·e',
      labelOff: 'Marquer comme accepté·e',
      labelOn: 'Annuler',
      type: 'boolean',
      withTooltip: true,
    },
    {
      action: _id => updateProjectContributorState(_id, PROJECT_CONTRIBUTOR_STATE.SUCCESSFUL),
      IconOff: () => <ToggleIconOff as={Star} />,
      IconOn: () => <ToggleIconOn as={Star} />,
      key: 'isSuccessful',
      label: 'Statut: Débloqué·e',
      labelOff: 'Marquer comme débloqué·e',
      labelOn: 'Annuler',
      type: 'boolean',
      withTooltip: true,
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{project.name}</Title>

        <Button onClick={goToEditor}>Éditer le projet</Button>
      </AdminHeader>

      <Card>
        <Subtitle>Contributeur·rices</Subtitle>

        <Table key={getRandomKey()} columns={columns as any} data={contributorLinks} defaultSortedKey="lastName" />
      </Card>

      <Card>
        <Subtitle>Notes</Subtitle>

        <NoteTextarea defaultValue={project.note || ''} name="note" onChange={updateProjectNote} />
      </Card>
    </AdminBox>
  )
}

export async function getServerSideProps({
  query,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<AdminProjectLinkerPageProps>> {
  const { id } = query
  if (typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  const project = await prisma.project.findUnique({
    include: {
      contributors: {
        include: {
          contributor: true,
        },
      },
      lead: true,
      organization: true,
      user: true,
    },
    where: {
      id,
    },
  })
  if (!project) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      projectAsSuperJson: superjson.stringify(project),
    },
  }
}
