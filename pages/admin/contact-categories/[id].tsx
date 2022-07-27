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
  label: Yup.string().trim().required(`L'étiquette est obligatoire.`),
})

export default function ContactCategoryEditor() {
  const api = useApi()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState({})
  const router = useRouter()
  const isMounted = useIsMounted()

  const id = getIdFromRequest(router)
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

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const contactCategoryData = R.pick(['description', 'label'])(values)

    const maybeBody = isNew
      ? await api.post(`contact-category/${id}`, contactCategoryData)
      : await api.patch(`contact-category/${id}`, contactCategoryData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Une erreur serveur est survenue.',
      })
      setSubmitting(false)

      return
    }

    router.back()
  }

  useEffect(() => {
    if (isNew) {
      setIsLoading(false)

      return
    }

    loadContactCategory()
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvelle catégorie de contact' : 'Édition d’une catégorie de contact'}</Title>
      </AdminHeader>

      <Card>
        <Form
          key={JSON.stringify(initialValues)}
          initialValues={initialValues}
          onSubmit={updateAndGoBack}
          validationSchema={FormSchema}
        >
          <Field>
            <Form.Input disabled={isLoading} label="Étiquette" name="label" />
          </Field>

          <Field>
            <Form.Textarea isDisabled={isLoading} label="Description" name="description" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
