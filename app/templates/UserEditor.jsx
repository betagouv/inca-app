import { Card } from '@ivangabriele/singularity'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import { ROLE } from '../../common/constants'
import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Field from '../atoms/Field'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import Form from '../molecules/Form'

const FormSchema = Yup.object().shape({
  email: Yup.string().required(`Email field is mandatory.`).email(`This email doesn't look well formatted.`),
})

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
    if (maybeBody === null) {
      return
    }

    const userEditableData = R.pick(['email', 'firstName', 'lastName', 'isActive', 'role'])(maybeBody.data)

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

  const updateUserAndGoToUserList = async (values, { setErrors, setSubmitting }) => {
    const maybeBody = isNew ? await api.post(`user/${id}`, values) : await api.patch(`user/${id}`, values)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    history.push('/users')
  }

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Ajout' : 'Modification'} d’utilisateur</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateUserAndGoToUserList} validationSchema={FormSchema}>
          <Form.Input label="Email" name="email" type="email" />

          {isNew && (
            <Field>
              <Form.Input label="Mot de passe" name="password" type="password" />
            </Field>
          )}

          <Field>
            <Form.Input label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input label="Nom" name="lastName" />
          </Field>

          <Field>
            <Form.Select
              label="Rôle"
              name="role"
              options={[
                {
                  label: 'Administrateur',
                  value: ROLE.ADMINISTRATOR,
                },
                {
                  label: 'Gestionnaire',
                  value: ROLE.MANAGER,
                },
                {
                  label: 'Membre',
                  value: ROLE.MEMBER,
                },
              ]}
            />
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
