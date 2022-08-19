import { prisma } from '@api/libs/prisma'
import AdminHeader from '@app/atoms/AdminHeader'
import { AdminNoteCard } from '@app/atoms/AdminNoteCard'
import Card from '@app/atoms/Card'
import Subtitle from '@app/atoms/Subtitle'
import Title from '@app/atoms/Title'
import { getProjectLinksFromContributor } from '@app/helpers/getProjectLinksFromContributor'
import getRandomKey from '@app/helpers/getRandomKey'
import { useApi } from '@app/hooks/useApi'
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

import type { FullContributor } from '@common/types'
import type { TableColumnProps } from '@singularity/core'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'name',
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

type AdminContributorLinkerPageProps = {
  contributorAsSuperJson: string
}
export default function AdminContributorLinkerPage({ contributorAsSuperJson }: AdminContributorLinkerPageProps) {
  const contributor = superjson.parse<FullContributor>(contributorAsSuperJson)

  const [projectLinks, setProjectLinks] = useState(getProjectLinksFromContributor(contributor))
  const router = useRouter()
  const api = useApi()

  const id = getIdFromRequest(router)

  const load = async () => {
    const maybeBody = await api.get(`contributors/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newProjectLinks = getProjectLinksFromContributor(maybeBody.data)

    setProjectLinks(newProjectLinks)
  }

  const goToEditor = () => {
    router.push(`/admin/contributors/${id}`)
  }

  const updateContributorNote = debounce(async event => {
    await api.patch(`contributors/${id}`, { note: event.target.value })
  }, 250)

  const updateProjectContributorState = async (projectId, state) => {
    const projectLink: any = R.find(R.propEq('id', projectId))(projectLinks)
    // const projectId = projectLink.id
    const newState = state !== projectLink.state ? state : PROJECT_CONTRIBUTOR_STATE.ASSIGNED

    await api.patch(`projects/${projectId}/${id}`, {
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
    <>
      <AdminHeader>
        <Title>{`${contributor.firstName} ${contributor.lastName}`}</Title>

        <Button onClick={goToEditor}>Éditer ce·tte contributeur·rice</Button>
      </AdminHeader>

      <Card>
        <Subtitle>Projets</Subtitle>

        <Table key={getRandomKey()} columns={columns as any} data={projectLinks} defaultSortedKey="name" />
      </Card>

      <AdminNoteCard>
        <Subtitle>Notes</Subtitle>

        <Textarea defaultValue={contributor.note || ''} name="note" onChange={updateContributorNote} />
      </AdminNoteCard>
    </>
  )
}

export async function getServerSideProps({
  query,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<AdminContributorLinkerPageProps>> {
  const { id } = query
  if (typeof id !== 'string') {
    return {
      notFound: true,
    }
  }

  const contributor = await prisma.contributor.findUnique({
    include: {
      projects: {
        include: {
          project: true,
        },
      },
    },
    where: {
      id,
    },
  })
  if (!contributor) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      contributorAsSuperJson: superjson.stringify(contributor),
    },
  }
}
