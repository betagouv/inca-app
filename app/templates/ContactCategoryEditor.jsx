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
  label: Yup.string().required(`L'étiquette est obligatoire.`),
})

export default function ContactCategoryEditor() {
  const api = useApi()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const history = useHistory()
  const isMounted = useIsMounted()

  const isNew = id === 'new'

  const loadContactCategory = async () => {
    const maybeBody = await api.get(`contact-category/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contactCategoryData = maybeBody.data
    const contactCategoryEditableData = R.pick(['description', 'label'])(contactCategoryData)

    if (isMounted()) {
      setInitialValues(contactCategoryEditableData)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isNew) {
      setInitialValues({})
      setIsLoading(false)

      return
    }

    loadContactCategory()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateContactCategoryAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const contactCategoryData = R.pick(['description', 'label'])(values)

    const maybeBody = isNew
      ? await api.post(`contact-category/${id}`, contactCategoryData)
      : await api.patch(`contact-category/${id}`, contactCategoryData)
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
        <Title>{isNew ? 'Nouvelle catégorie de contact' : 'Édition d’une catégorie de contact'}</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateContactCategoryAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input label="Étiquette" name="label" />
          </Field>

          <Field>
            <Form.Textarea label="Description" name="description" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Enregistrer'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
