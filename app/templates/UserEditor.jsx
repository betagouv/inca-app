import { Card, Field } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import { USER_ROLE_LABEL } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
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
  roleAsOption: Yup.object().required(`Le rôle est obligatoire.`),
})

const USER_ROLES_AS_OPTIONS = R.pipe(
  R.toPairs,
  R.map(([value, label]) => ({ label, value })),
)(USER_ROLE_LABEL)

export default function UserEditor() {
  const api = useApi()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()

  const isNew = id === 'new'

  const loadUser = async () => {
    const maybeBody = await api.get(`user/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const userData = maybeBody.data

    const userEditableData = R.pick(['email', 'firstName', 'lastName', 'isActive'])(userData)

    userEditableData.roleAsOption = {
      label: USER_ROLE_LABEL[userData.role],
      value: userData.role,
    }

    if (isMounted()) {
      setInitialValues(userEditableData)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isNew) {
      setInitialValues({})
      setIsLoading(false)

      return
    }

    loadUser()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUserAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const userData = R.pick(['email', 'firstName', 'isActive', 'lastName', 'password'])(values)
    userData.role = values.roleAsOption.value

    const maybeBody = isNew ? await api.post(`user/${id}`, values) : await api.patch(`user/${id}`, userData)
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
        <Title>{isNew ? 'Nouvel·le utilisateur·rice' : 'Édition d’un·e utilisateur·rice'}</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateUserAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input label="Email" name="email" type="email" />
          </Field>

          <Field>
            <Form.Input label="Mot de passe" name="password" type="password" />
          </Field>

          <Field>
            <Form.Input label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input label="Nom" name="lastName" />
          </Field>

          <Field>
            <Form.Select label="Rôle" name="roleAsOption" options={USER_ROLES_AS_OPTIONS} />
          </Field>

          <Field>
            <Form.Checkbox label="Compte actif" name="isActive" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Enregistrer'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
