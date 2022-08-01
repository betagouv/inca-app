import AdminBox from '@app/atoms/AdminBox'
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
  organizationAsOption: Yup.object().required(`Associer une organisation est obligatoire.`),
})

export default function AdminLeadEditorPage() {
  const [contactCategoriesAsOptions, setContactCategoriesAsOptions] = useState([])
  const [organizationsAsOptions, setOrganizationsAsOptions] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const api = useApi()

  const id = getIdFromRequest(router)
  const isReady = !isLoading && contactCategoriesAsOptions.length && organizationsAsOptions.length
  const isNew = id === 'new'

  const loadLead = async () => {
    const maybeBody = await api.get(`leads/${id}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const leadData = maybeBody.data
    const leadEditableData: any = R.pick(['email', 'firstName', 'lastName', 'note', 'phone', 'position'])(leadData)
    if (leadData.contactCategoryId !== null) {
      leadEditableData.contactCategoryAsOption = {
        label: leadData.contactCategory.label,
        value: leadData.contactCategoryId,
      }
    }
    leadEditableData.organizationAsOption = {
      label: leadData.organization.name,
      value: leadData.organizationId,
    }

    setInitialValues(leadEditableData)
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

  const loadOrganizationsAsOptions = async () => {
    const maybeBody = await api.get(`organizations`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const newOrganizationsAsOptions: any = R.pipe(
      R.sortBy(R.prop('name')),
      R.map(({ id: _id, name }: any) => ({
        label: name,
        value: _id,
      })),
    )(maybeBody.data)

    setOrganizationsAsOptions(newOrganizationsAsOptions)
  }

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const leadData: any = R.pick(['email', 'firstName', 'lastName', 'note', 'phone', 'position'])(values)
    leadData.contactCategoryId = values.contactCategoryAsOption.value
    leadData.organizationId = values.organizationAsOption.value

    const maybeBody = isNew ? await api.post(`leads`, leadData) : await api.patch(`leads/${id}`, leadData)
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
    loadOrganizationsAsOptions()

    if (isNew) {
      setIsLoading(false)

      return
    }

    loadLead()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminBox>
      <AdminHeader>
        <Title>{isNew ? 'Nouvel·le porteur·se' : 'Édition d’un·e porteur·se'}</Title>
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
            <Form.Select
              isDisabled={!isReady}
              label="Organisation"
              name="organizationAsOption"
              options={organizationsAsOptions}
            />
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
