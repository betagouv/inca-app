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
  name: Yup.string().required(`La dénomination est obligatoire.`),
})

export default function OrganizationEditor() {
  const api = useApi()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()

  const isNew = id === 'new'

  const loadOrganization = async () => {
    const maybeBody = await api.get(`organization/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const organizationData = maybeBody.data
    const organizationEditableData = R.pick(['name', 'note'])(organizationData)

    if (isMounted()) {
      setInitialValues(organizationEditableData)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isNew) {
      setInitialValues({})
      setIsLoading(false)

      return
    }

    loadOrganization()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateOrganizationAndGoToOrganizationList = async (values, { setErrors, setSubmitting }) => {
    const organizationData = R.pick(['name', 'note'])(values)

    const maybeBody = isNew
      ? await api.post(`organization/${id}`, values)
      : await api.patch(`organization/${id}`, organizationData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    history.push('/organizations')
  }

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvelle organisation' : 'Édition d’une organisation'}</Title>
      </AdminHeader>

      <Card>
        <Form
          initialValues={initialValues}
          onSubmit={updateOrganizationAndGoToOrganizationList}
          validationSchema={FormSchema}
        >
          <Field>
            <Form.Input label="Dénomination" name="name" />
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
