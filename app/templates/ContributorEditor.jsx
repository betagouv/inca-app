import { Card } from '@ivangabriele/singularity'
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

export default function ContributorEditor() {
  const api = useApi()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()

  const isNew = id === 'new'

  const loadContributor = async () => {
    const maybeBody = await api.get(`contributor/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contributorData = maybeBody.data
    const contributorEditableData = R.pick(['firstName', 'lastName', 'email', 'phone'])(contributorData)

    if (isMounted()) {
      setInitialValues(contributorEditableData)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isNew) {
      setInitialValues({})
      setIsLoading(false)

      return
    }

    loadContributor()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateContributorAndGoToContributorList = async (values, { setErrors, setSubmitting }) => {
    const contributorData = R.pick(['firstName', 'lastName', 'email', 'phone'])(values)

    const maybeBody = isNew
      ? await api.post(`contributor/${id}`, values)
      : await api.patch(`contributor/${id}`, contributorData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    history.push('/contributors')
  }

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvel·le contributeur·rice' : 'Édition d’un·e contributeur·rice'}</Title>
      </AdminHeader>

      <Card>
        <Form
          initialValues={initialValues}
          onSubmit={updateContributorAndGoToContributorList}
          validationSchema={FormSchema}
        >
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
            <Form.Submit>{isNew ? 'Créer' : 'Enregistrer'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}