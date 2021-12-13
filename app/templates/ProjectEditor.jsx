import { Card } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Field from '../atoms/Field'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import Form from '../molecules/Form'

const FormSchema = Yup.object().shape({
  leadAsOption: Yup.object().required(`Associer un·e porteur·se de projet est obligatoire.`),
  name: Yup.string().required(`Le nom du projet obligatoire.`),
  userAsOption: Yup.object().required(`Associer un·e chargé·e de projet est obligatoire.`),
})

export default function ProjectEditor() {
  const { id } = useParams()
  const [initialValues, setInitialValues] = useState(null)
  const [contributorsAsOptions, setContributorsAsOptions] = useState(null)
  const [leadsAsOptions, setLeadsAsOptions] = useState(null)
  const [usersAsOptions, setUsersAsOptions] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()
  const api = useApi()

  const isNew = id === 'new'
  const isLoading = initialValues === null || leadsAsOptions === null || usersAsOptions === null

  const loadProject = async () => {
    const maybeBody = await api.get(`project/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const projectData = maybeBody.data

    const projectEditableData = R.pick(['description', 'hasEnded', 'hasStarted', 'name', 'need', 'note'])(projectData)

    projectEditableData.contributorsAsOptions = R.pipe(
      R.sortBy(R.path(['contributor', 'lastName'])),
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
    }
  }

  const loadContributorsAsOptions = async () => {
    const maybeBody = await api.get(`contributors`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contributorsAsOptions = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id, lastName }) => ({
        label: `${firstName} ${lastName}`,
        value: id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setContributorsAsOptions(contributorsAsOptions)
    }
  }

  const loadLeadsAsOptions = async () => {
    const maybeBody = await api.get(`leads`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const leadsAsOptions = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id, lastName, organization, organizationId }) => ({
        label: `${firstName} ${lastName} [${organization.name}]`,
        organizationId,
        value: id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setLeadsAsOptions(leadsAsOptions)
    }
  }

  const loadUsersAsOptions = async () => {
    const maybeBody = await api.get(`users`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const usersAsOptions = R.pipe(
      R.sortBy(R.prop('lastName')),
      R.map(({ firstName, id, lastName }) => ({
        label: `${firstName} ${lastName}`,
        value: id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setUsersAsOptions(usersAsOptions)
    }
  }

  useEffect(() => {
    loadContributorsAsOptions()
    loadLeadsAsOptions()
    loadUsersAsOptions()

    if (isNew) {
      setInitialValues({})

      return
    }

    loadProject()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateProjectAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const projectData = R.pick(['description', 'hasEnded', 'hasStarted', 'name', 'need', 'note'])(values)
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
        email: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    history.goBack()
  }

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouveau projet' : 'Édition de projet'}</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateProjectAndGoBack} validationSchema={FormSchema}>
          <Form.Input label="Nom" name="name" />

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
            <Form.Submit>{isNew ? 'Créer' : 'Enregistrer'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
