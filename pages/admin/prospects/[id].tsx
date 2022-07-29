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
  contactCategoryAsOption: Yup.object().required(`Associer une catégorie de contact est obligatoire.`),
  email: Yup.string()
    .trim()
    .required(`L’adresse email est obligatoire.`)
    .email(`Cette addresse email ne semble pas correctement formatté.`),
  firstName: Yup.string().trim().required(`Le prénom est obligatoire.`),
  lastName: Yup.string().trim().required(`Le nom de famille est obligatoire.`),
})

export default function AdminProspectEditorPage() {
  const [contactCategoriesAsOptions, setContactCategoriesAsOptions] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const api = useApi()
  const isMounted = useIsMounted()

  const id = getIdFromRequest(router)
  const isReady = !isLoading && contactCategoriesAsOptions.length
  const isNew = id === 'new'

  const loadProspect = async () => {
    const maybeBody = await api.get(`prospects/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const prospectData = maybeBody.data
    const prospectEditableData: any = R.pick([
      'email',
      'firstName',
      'lastName',
      'note',
      'organization',
      'phone',
      'position',
    ])(prospectData)
    prospectEditableData.contactCategoryAsOption = {
      label: prospectData.contactCategory.label,
      value: prospectData.contactCategoryId,
    }

    if (isMounted()) {
      setInitialValues(prospectEditableData)
      setIsLoading(false)
    }
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

    if (isMounted()) {
      setContactCategoriesAsOptions(newContactCategoriesAsOptions)
    }
  }

  const updateProspectAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const prospectData: any = R.pick(['email', 'firstName', 'lastName', 'note', 'organization', 'phone', 'position'])(
      values,
    )
    prospectData.contactCategoryId = values.contactCategoryAsOption.value

    const maybeBody = isNew
      ? await api.post('prospects', prospectData)
      : await api.patch(`prospects/${id}`, prospectData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Une erreur serveur est survenue.',
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

    loadProspect()
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvel·le prospect·e' : 'Édition d’un·e prospect·e'}</Title>
      </AdminHeader>

      <Card>
        <Form
          key={JSON.stringify(initialValues)}
          initialValues={initialValues}
          onSubmit={updateProspectAndGoBack}
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
            <Form.Input disabled={!isReady} label="Organisation" name="organization" />
          </Field>

          <Field>
            <Form.Input disabled={!isReady} label="Poste" name="position" />
          </Field>

          <Field>
            <Form.Textarea disabled={!isReady} label="Notes" name="note" />
          </Field>

          <Field>
            <Form.Submit>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
