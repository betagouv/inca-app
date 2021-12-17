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
  email: Yup.string()
    .required(`L’adresse email est obligatoire.`)
    .email(`Cette addresse email ne semble pas correctement formatté.`),
  firstName: Yup.string().required(`Le prénom est obligatoire.`),
  lastName: Yup.string().required(`Le nom de famille est obligatoire.`),
  organizationAsOption: Yup.object().required(`Associer une organisation est obligatoire.`),
})

export default function LeadEditor() {
  const [organizationsAsOptions, setOrganizationsAsOptions] = useState(null)
  const [initialValues, setInitialValues] = useState(null)
  const { id } = useParams()
  const history = useHistory()
  const api = useApi()
  const isMounted = useIsMounted()

  const isLoading = initialValues === null || organizationsAsOptions === null
  const isNew = id === 'new'

  const loadLead = async () => {
    const maybeBody = await api.get(`lead/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const leadData = maybeBody.data
    const leadEditableData = R.pick(['email', 'firstName', 'lastName', 'note', 'phone', 'position'])(leadData)

    leadEditableData.organizationAsOption = {
      label: leadData.organization.name,
      value: leadData.organizationId,
    }

    if (isMounted()) {
      setInitialValues(leadEditableData)
    }
  }

  const loadOrganizationsAsOptions = async () => {
    const maybeBody = await api.get(`organizations`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const organizationsAsOptions = R.pipe(
      R.sortBy(R.prop('name')),
      R.map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setOrganizationsAsOptions(organizationsAsOptions)
    }
  }

  useEffect(() => {
    loadOrganizationsAsOptions()

    if (isNew) {
      setInitialValues({})

      return
    }

    loadLead()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateLeadAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const leadData = R.pick(['email', 'firstName', 'lastName', 'note', 'phone', 'position'])(values)
    leadData.organizationId = values.organizationAsOption.value

    const maybeBody = isNew ? await api.post(`lead/${id}`, leadData) : await api.patch(`lead/${id}`, leadData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Sorry, but something went wrong.',
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
        <Title>{isNew ? 'Nouvel·le porteur·se' : 'Édition d’un·e porteur·se'}</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateLeadAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input label="Nom" name="lastName" />
          </Field>

          <Field>
            <Form.Input label="Email" name="email" type="email" />
          </Field>

          <Field>
            <Form.Input label="Téléphone" name="phone" type="tel" />
          </Field>

          <Field>
            <Form.Select label="Organisation" name="organizationAsOption" options={organizationsAsOptions} />
          </Field>

          <Field>
            <Form.Input label="Poste" name="position" />
          </Field>

          <Field>
            <Form.Textarea label="Notes" name="note" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Enregistrer'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
