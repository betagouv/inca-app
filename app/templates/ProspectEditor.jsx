import { Card } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Field from '../atoms/Field'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import Form from '../molecules/Form'

const FormSchema = Yup.object().shape({
  contactCategoryAsOption: Yup.object().required(`Associer une catégorie de contact est obligatoire.`),
  email: Yup.string()
    .required(`L’adresse email est obligatoire.`)
    .email(`Cette addresse email ne semble pas correctement formatté.`),
  firstName: Yup.string().required(`Le prénom est obligatoire.`),
  lastName: Yup.string().required(`Le nom de famille est obligatoire.`),
})

export default function ProspectEditor() {
  const [contactCategoriesAsOptions, setContactCategoriesAsOptions] = useState(null)
  const [initialValues, setInitialValues] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const isMounted = useIsMounted()

  const isLoading = initialValues === null || contactCategoriesAsOptions === null
  const isNew = id === 'new'

  const loadProspect = async () => {
    const maybeBody = await api.get(`prospect/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const prospectData = maybeBody.data
    const prospectEditableData = R.pick([
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
    }
  }

  const loadContactCategoriesAsOptions = async () => {
    const maybeBody = await api.get(`contact-categories`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const contactCategoriesAsOptions = R.pipe(
      R.sortBy(R.prop('label')),
      R.map(({ id, label }) => ({
        label,
        value: id,
      })),
    )(maybeBody.data)

    if (isMounted()) {
      setContactCategoriesAsOptions(contactCategoriesAsOptions)
    }
  }

  useEffect(() => {
    loadContactCategoriesAsOptions()

    if (isNew) {
      setInitialValues({})

      return
    }

    loadProspect()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateProspectAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const prospectData = R.pick(['email', 'firstName', 'lastName', 'note', 'organization', 'phone', 'position'])(values)
    prospectData.contactCategoryId = values.contactCategoryAsOption.value

    const maybeBody = isNew
      ? await api.post(`prospect/${id}`, prospectData)
      : await api.patch(`prospect/${id}`, prospectData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    navigate('..')
  }

  if (isLoading) {
    return 'Loading...'
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvel·le prospect·e' : 'Édition d’un·e prospect·e'}</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateProspectAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Select
              label="Catégorie de contact"
              name="contactCategoryAsOption"
              options={contactCategoriesAsOptions}
            />
          </Field>

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
            <Form.Input label="Organisation" name="organization" />
          </Field>

          <Field>
            <Form.Input label="Poste" name="position" />
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
