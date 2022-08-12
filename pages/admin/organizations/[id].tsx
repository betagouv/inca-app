import AdminHeader from '@app/atoms/AdminHeader'
import Field from '@app/atoms/Field'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useState } from 'react'
import * as Yup from 'yup'

const FormSchema = Yup.object().shape({
  name: Yup.string().trim().required(`La dénomination est obligatoire.`),
})

export default function AdminOrganizationEditorPage() {
  const api = useApi()
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState({})
  const router = useRouter()

  const id = getIdFromRequest(router)
  const isNew = id === 'new'

  const load = useCallback(async () => {
    const maybeBody = await api.get(`organizations/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const organizationData = maybeBody.data
    const organizationEditableData = R.pick(['name', 'note'])(organizationData)

    setInitialValues(organizationEditableData)
    setIsLoading(false)
  }, [api, id])

  useEffect(() => {
    if (isNew) {
      setIsLoading(false)

      return
    }

    load()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateOrganizationAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const organizationData = R.pick(['name', 'note'])(values)

    const maybeBody = isNew
      ? await api.post(`organizations`, organizationData)
      : await api.patch(`organizations/${id}`, organizationData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Une erreur serveur est survenue.',
      })
      setSubmitting(false)

      return
    }

    router.back()
  }

  return (
    <>
      <AdminHeader>
        <Title>{isNew ? 'Nouvelle organisation' : 'Édition d’une organisation'}</Title>
      </AdminHeader>

      <Card>
        <Form
          key={JSON.stringify(initialValues)}
          initialValues={initialValues}
          onSubmit={updateOrganizationAndGoBack}
          validationSchema={FormSchema}
        >
          <Field>
            <Form.Input disabled={isLoading} label="Dénomination" name="name" />
          </Field>

          <Field>
            <Form.Textarea disabled={isLoading} label="Notes" name="note" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </>
  )
}
