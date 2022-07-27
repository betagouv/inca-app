import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Field from '@app/atoms/Field'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import Form from '@app/molecules/Form'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'

const FormSchema = Yup.object().shape({
  leadAsOption: Yup.object().required(`Associer un·e porteur·se de projet est obligatoire.`),
  name: Yup.string().trim().required(`Le nom du projet obligatoire.`),
  userAsOption: Yup.object().required(`Associer un·e chargé·e de projet est obligatoire.`),
})

export default function AdminProjectEditorPage() {
  const [initialValues, setInitialValues] = useState({})
  const [contributorsAsOptions, setContributorsAsOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [leadsAsOptions, setLeadsAsOptions] = useState([])
  const [usersAsOptions, setUsersAsOptions] = useState([])
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()

  const id = getIdFromRequest(router)
  const isNew = id === 'new'
  const isReady = !isLoading && contributorsAsOptions.length && leadsAsOptions.length && usersAsOptions.length

  const load = async () => {
    const maybeBody = await api.get(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const projectData = maybeBody.data

    const projectEditableData: any = R.pick(['description', 'hasEnded', 'hasStarted', 'name', 'need', 'note'])(
      projectData,
    )

    projectEditableData.contributorsAsOptions = R.pipe(
      R.sortBy<any>(R.path<any>(['contributor', 'lastName'])),
      R.map(({ contributor }) => ({
        label: `${contributor.firstName} ${contributor.lastName}`,
        value: contributor.id,
      })),
    )(projectData.contributors)

    projectEditableData.leadAsOption = {
      label: `${projectData.lead.firstName} ${projectData.lead.lastName} [${projectData.organization.name}]`,
      value: projectData.leadId,
    }

    projectEditableData.userAsOption = {
      label: `${projectData.user.firstName} ${projectData.user.lastName}`,
      value: projectData.userId,
    }

    if (isMounted()) {
      setInitialValues(projectEditableData)
      setIsLoading(false)
    }
  }

  const loadContributorsAsOptions = async () => {
    const maybeBody = await api.get(`contributors`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newContributorsAsOptions: any = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id: _id, lastName }: any) => ({
        label: `${firstName} ${lastName}`,
        value: _id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setContributorsAsOptions(newContributorsAsOptions)
    }
  }

  const loadLeadsAsOptions = async () => {
    const maybeBody = await api.get(`leads`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newLeadsAsOptions: any = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id: _id, lastName, organization, organizationId }: any) => ({
        label: `${firstName} ${lastName} [${organization.name}]`,
        organizationId,
        value: _id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setLeadsAsOptions(newLeadsAsOptions)
    }
  }

  const loadUsersAsOptions = async () => {
    const maybeBody = await api.get(`users`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newUsersAsOptions: any = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id: _id, lastName }: any) => ({
        label: `${firstName} ${lastName}`,
        value: _id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setUsersAsOptions(newUsersAsOptions)
    }
  }

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const projectData: any = R.pick(['description', 'hasEnded', 'hasStarted', 'name', 'need', 'note'])(values)
    projectData.leadId = values.leadAsOption.value
    projectData.organizationId = values.leadAsOption.organizationId
    projectData.userId = values.userAsOption.value

    projectData.contributorIds =
      values.contributorsAsOptions !== undefined ? values.contributorsAsOptions.map(({ value }) => value) : []

    const maybeBody = isNew
      ? await api.post(`project/${id}`, projectData)
      : await api.patch(`project/${id}`, projectData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Une erreur serveur est survenue.',
      })
      setSubmitting(false)

      return
    }

    router.back()
  }

  useEffect(() => {
    loadContributorsAsOptions()
    loadLeadsAsOptions()
    loadUsersAsOptions()

    if (isNew) {
      setIsLoading(false)

      return
    }

    load()
  }, [])

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
            <Form.Select isDisabled={!isReady} label="Porteur·se" name="leadAsOption" options={leadsAsOptions} />
          </Field>

          <Field>
            <Form.Select
              isDisabled={!isReady}
              isMulti
              label="Contributeur·rices proposé·es"
              name="contributorsAsOptions"
              options={contributorsAsOptions}
            />
          </Field>

          <Field>
            <Form.Select
              isDisabled={!isReady}
              label="Chargé·e de projet"
              name="userAsOption"
              options={usersAsOptions}
            />
          </Field>

          <Field>
            <Form.Textarea isDisabled={!isReady} label="Description" name="description" />
          </Field>

          <Field>
            <Form.Textarea isDisabled={!isReady} label="Besoin" name="need" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
