import { prisma } from '@api/libs/prisma'
import AdminHeader from '@app/atoms/AdminHeader'
import Field from '@app/atoms/Field'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import superjson from 'superjson'
import * as Yup from 'yup'

import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const FormSchema = Yup.object().shape({
  label: Yup.string().trim().required(`L'étiquette est obligatoire.`),
})

type AdminContactCategoryEditorProps = {
  SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY: string
  initialValuesAsSuperJson: string
  isNew: boolean
}
export default function AdminContactCategoryEditor({
  initialValuesAsSuperJson,
  isNew,
  SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
}: AdminContactCategoryEditorProps) {
  const api = useApi()
  const router = useRouter()

  const initialValues: Record<string, any> = superjson.parse(initialValuesAsSuperJson)
  const isProtected = !isNew && initialValues.label === SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY

  const updateAndGoBack = async (values, { setErrors, setSubmitting }) => {
    const contactCategoryData = R.pick([
      'contributorSurveyAnswerValue',
      'description',
      'label',
      'leadSurveyAnswerValue',
    ])(values)

    const path = isNew ? 'contact-categories' : `contact-categories/${initialValues.id}`
    const maybeBody = isNew ? await api.post(path, contactCategoryData) : await api.patch(path, contactCategoryData)
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
            <Form.Input disabled={isProtected} label="Étiquette" name="label" />
          </Field>

          <Field>
            <Form.Textarea disabled={isProtected} label="Description" name="description" />
          </Field>

          <Field>
            <Form.Input
              disabled={isProtected}
              label="Réponse Tell Me (Contributeur·rices)"
              name="contributorSurveyAnswerValue"
            />
          </Field>

          <Field>
            <Form.Input disabled={isProtected} label="Réponse Tell Me (Porteur·ses)" name="leadSurveyAnswerValue" />
          </Field>

          <Field>
            <Form.Submit disabled={isProtected}>{isNew ? 'Créer' : 'Mettre à jour'}</Form.Submit>
          </Field>
        </Form>
      </Card>
    </>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminContactCategoryEditorProps>> {
  const { SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY } = process.env
  if (!SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY) {
    console.error('Fatal: `SYNCHRONIZATION_START_DATE` env is undefined.')
    process.exit(1)
  }

  const id = getIdFromRequest(context)
  if (id === 'new') {
    return {
      props: {
        initialValuesAsSuperJson: '{}',
        isNew: true,
        SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
      },
    }
  }

  const contactCategory = await prisma.contactCategory.findUnique({
    where: {
      id,
    },
  })
  if (!contactCategory) {
    return {
      notFound: true,
    }
  }

  const initialValuesAsSuperJson = superjson.stringify(contactCategory)

  return {
    props: {
      initialValuesAsSuperJson,
      isNew: false,
      SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
    },
  }
}
