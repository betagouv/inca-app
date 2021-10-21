import { Card } from '@singularity-ui/core'
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
})

export default function LeadEditor() {
  const api = useApi()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()

  const isNew = id === 'new'

  const loadLead = async () => {
    const maybeBody = await api.get(`lead/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const leadData = maybeBody.data
    const leadEditableData = R.pick(['email', 'firstName', 'lastName', 'note', 'phone'])(leadData)

    if (isMounted()) {
      setInitialValues(leadEditableData)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isNew) {
      setInitialValues({})
      setIsLoading(false)

      return
    }

    loadLead()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateLeadAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const leadData = R.pick(['email', 'firstName', 'lastName', 'note', 'phone'])(values)

    const maybeBody = isNew ? await api.post(`lead/${id}`, values) : await api.patch(`lead/${id}`, leadData)
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
