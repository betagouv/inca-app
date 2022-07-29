import { loadContributorsAsOptions } from '@api/helpers/loadContributorsAsOptions'
import { loadLeadsAsOptions } from '@api/helpers/loadLeadsAsOptions'
import { loadOrganizationsAsOptions } from '@api/helpers/loadOrganizationsAsOptions'
import { loadUsersAsOptions } from '@api/helpers/loadUsersAsOptions'
import { prisma } from '@api/libs/prisma'
import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Field from '@app/atoms/Field'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card } from '@singularity/core'
import { useRouter } from 'next/router'
import { map, path as propPath, pick, pipe, sortBy } from 'ramda'
import superjson from 'superjson'
import * as Yup from 'yup'

import type { Option } from '@common/types'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const FormSchema = Yup.object().shape({
  leadAsOption: Yup.object().required(`Associer un·e porteur·se de projet est obligatoire.`),
  name: Yup.string().trim().required(`Le nom du projet obligatoire.`),
  organizationAsOption: Yup.object().required(`Associer une organisation est obligatoire.`),
  userAsOption: Yup.object().required(`Associer un·e chargé·e de projet est obligatoire.`),
})

type AdminProjectEditorPageProps = {
  contributorsAsOptions: Option[]
  initialValuesAsSuperJson: string
  isNew: boolean
  leadsAsOptions: Option[]
  organizationsAsOptions: Option[]
  usersAsOptions: Option[]
}
export default function AdminProjectEditorPage({
  contributorsAsOptions,
  initialValuesAsSuperJson,
  isNew,
  leadsAsOptions,
  organizationsAsOptions,
  usersAsOptions,
}: AdminProjectEditorPageProps) {
  const router = useRouter()
  const api = useApi()

  const initialValues: Record<string, any> = superjson.parse(initialValuesAsSuperJson)

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const projectData: any = pick(['description', 'hasEnded', 'hasStarted', 'name', 'need', 'note'])(values)
    projectData.leadId = values.leadAsOption.value
    projectData.organizationId = values.organizationAsOption.value
    projectData.userId = values.userAsOption.value

    projectData.contributorIds =
      values.contributorsAsOptions !== undefined ? values.contributorsAsOptions.map(({ value }) => value) : []

    const path = isNew ? 'projects' : `projects/${initialValues.id}`
    const maybeBody = isNew ? await api.post(path, projectData) : await api.patch(path, projectData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Une erreur serveur est survenue.',
      })
      setSubmitting(false)

      return
    }

    router.back()
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouveau projet' : 'Édition de projet'}</Title>
      </AdminHeader>

      <Card>
        <Form
          key={JSON.stringify(initialValues)}
          initialValues={initialValues}
          onSubmit={updateAndGoBack}
          validationSchema={FormSchema}
        >
          <Form.Input label="Nom" name="name" />

          <Field>
            <Form.Select label="Organisation" name="organizationAsOption" options={organizationsAsOptions} />
          </Field>

          <Field>
            <Form.Select label="Porteur·se" name="leadAsOption" options={leadsAsOptions} />
          </Field>

          <Field>
            <Form.Select
              isMulti
              label="Contributeur·rices proposé·es"
              name="contributorsAsOptions"
              options={contributorsAsOptions}
            />
          </Field>

          <Field>
            <Form.Select label="Chargé·e de projet" name="userAsOption" options={usersAsOptions} />
          </Field>

          <Field>
            <Form.Textarea label="Description" name="description" />
          </Field>

          <Field>
            <Form.Textarea label="Besoin" name="need" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminProjectEditorPageProps>> {
  const id = getIdFromRequest(context)

  const contributorsAsOptions = await loadContributorsAsOptions()
  const organizationsAsOptions = await loadOrganizationsAsOptions()
  const leadsAsOptions = await loadLeadsAsOptions()
  const usersAsOptions = await loadUsersAsOptions()

  if (id === 'new') {
    return {
      props: {
        contributorsAsOptions,
        initialValuesAsSuperJson: '{}',
        isNew: true,
        leadsAsOptions,
        organizationsAsOptions,
        usersAsOptions,
      },
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

  const projectContributorsAsOptions = pipe(
    sortBy<any>(propPath<any>(['contributor', 'lastName'])),
    map(({ contributor }) => ({
      label: `${contributor.firstName} ${contributor.lastName}`,
      value: contributor.id,
    })),
  )(project.contributors)
  const projectLeadAsOption = {
    label: `${project.lead.firstName} ${project.lead.lastName} [${project.organization.name}]`,
    value: project.leadId,
  }
  const projectOrganizationAsOption = {
    label: project.organization.name,
    value: project.userId,
  }
  const projectUserAsOption = {
    label: `${project.user.firstName} ${project.user.lastName}`,
    value: project.userId,
  }
  const initialValues = {
    ...project,
    contributorsAsOptions: projectContributorsAsOptions,
    leadAsOption: projectLeadAsOption,
    organizationAsOption: projectOrganizationAsOption,
    userAsOption: projectUserAsOption,
  }

  const initialValuesAsSuperJson = superjson.stringify(initialValues)

  return {
    props: {
      contributorsAsOptions,
      initialValuesAsSuperJson,
      isNew: false,
      leadsAsOptions,
      organizationsAsOptions,
      usersAsOptions,
    },
  }
}
