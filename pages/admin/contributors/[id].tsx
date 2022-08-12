import AdminHeader from '@app/atoms/AdminHeader'
import Field from '@app/atoms/Field'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'

const FormSchema = Yup.object().shape({
  contactCategoryAsOption: Yup.object().required(`Associer une catégorie de contact est obligatoire.`),
  email: Yup.string()
    .trim()
    .required(`L’adresse email est obligatoire.`)
    .email(`Cette addresse email ne semble pas correctement formatté.`),
  firstName: Yup.string().trim().required(`Le prénom est obligatoire.`),
  lastName: Yup.string().trim().required(`Le nom de famille est obligatoire.`),
})

export default function AdminContributorEditorPage() {
  const [contactCategoriesAsOptions, setContactCategoriesAsOptions] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const api = useApi()

  const id = getIdFromRequest(router)
  const isReady = !isLoading && contactCategoriesAsOptions.length
  const isNew = id === 'new'

  const loadContributor = async () => {
    const maybeBody = await api.get(`contributors/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contributorData = maybeBody.data
    const contributorEditableData: any = R.pick(['email', 'firstName', 'lastName', 'note', 'phone'])(contributorData)
    if (contributorData.contactCategoryId !== null) {
      contributorEditableData.contactCategoryAsOption = {
        label: contributorData.contactCategory.label,
        value: contributorData.contactCategoryId,
      }
    }

    setInitialValues(contributorEditableData)
    setIsLoading(false)
  }

  const loadContactCategoriesAsOptions = async () => {
    const maybeBody = await api.get(`contact-categories`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newContactCategoriesAsOptions: any = R.pipe(
      R.sortBy(R.prop('label')),
      R.map(({ id: _id, label }: any) => ({
        label,
        value: _id,
      })),
    )(maybeBody.data)

    setContactCategoriesAsOptions(newContactCategoriesAsOptions)
  }

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const contributorData: any = R.pick(['email', 'firstName', 'lastName', 'note', 'phone'])(values)
    contributorData.contactCategoryId = values.contactCategoryAsOption.value

    const maybeBody = isNew
      ? await api.post(`contributors`, contributorData)
      : await api.patch(`contributors/${id}`, contributorData)
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
    loadContactCategoriesAsOptions()

    if (isNew) {
      setIsLoading(false)

      return
    }

    loadContributor()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <AdminHeader>
        <Title>{isNew ? 'Nouvel·le contributeur·rice' : 'Édition d’un·e contributeur·rice'}</Title>
      </AdminHeader>

      <Card>
        <Form
          key={JSON.stringify(initialValues)}
          initialValues={initialValues}
          onSubmit={updateAndGoBack}
          validationSchema={FormSchema}
        >
          <Field>
            <Form.Select
              isDisabled={!isReady}
              label="Catégorie de contact"
              name="contactCategoryAsOption"
              options={contactCategoriesAsOptions}
            />
          </Field>

          <Field>
            <Form.Input disabled={!isReady} label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input disabled={!isReady} label="Nom" name="lastName" />
          </Field>

          <Field>
            <Form.Input disabled={!isReady} label="Email" name="email" type="email" />
          </Field>

          <Field>
            <Form.Input disabled={!isReady} label="Téléphone" name="phone" type="tel" />
          </Field>

          <Field>
            <Form.Textarea disabled={!isReady} label="Notes" name="note" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </>
  )
}
