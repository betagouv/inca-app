import { prisma } from '@api/libs/prisma'
import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { USER_ROLE_LABEL } from '@common/constants'
import { getIdFromRequest } from '@common/helpers/getIdFromRequest'
import { Card, Field } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import * as Yup from 'yup'

import type { User } from '@prisma/client'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const FormSchema = Yup.object().shape({
  email: Yup.string()
    .required(`L’adresse email est obligatoire.`)
    .email(`Cette addresse email ne semble pas correctement formatté.`),
  firstName: Yup.string().required(`Le prénom est obligatoire.`),
  lastName: Yup.string().required(`Le nom de famille est obligatoire.`),
  roleAsOption: Yup.object().required(`Le rôle est obligatoire.`),
})

const USER_ROLES_AS_OPTIONS = R.pipe(
  R.toPairs,
  R.map(([value, label]) => ({ label, value })),
)(USER_ROLE_LABEL)

type AdminUserEditorPageProps = {
  userData: Pick<User, 'email' | 'firstName' | 'id' | 'isActive' | 'lastName' | 'role'>
}
export default function AdminUserEditorPage({ userData }) {
  const api = useApi()
  const router = useRouter()

  const initialValues: any = {
    ...userData,
    roleAsOption: USER_ROLES_AS_OPTIONS.find(R.propEq('value', userData.role)),
  }

  const updateAndGoBack = async (values: any, { setErrors, setSubmitting }) => {
    const newUserData: any = R.pick(['email', 'firstName', 'isActive', 'lastName', 'password'])(values)
    newUserData.role = values.roleAsOption.value

    const maybeBody = await api.patch(`users/${userData.id}`, userData)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        email: 'Une erreur serveur est survenue.',
      })
      setSubmitting(false)

      return
    }

    router.back()
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Édition d’un·e utilisateur·rice</Title>
      </AdminHeader>

      <Card>
        <Form initialValues={initialValues} onSubmit={updateAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input label="Email" name="email" type="email" />
          </Field>

          <Field>
            <Form.Input label="Prénom" name="firstName" />
          </Field>

          <Field>
            <Form.Input label="Nom" name="lastName" />
          </Field>

          <Field>
            <Form.Select label="Rôle" name="roleAsOption" options={USER_ROLES_AS_OPTIONS} />
          </Field>

          <Field>
            <Form.Checkbox label="Compte actif" name="isActive" />
          </Field>

          <Field>
            <Form.Submit>Mettre à jour</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminUserEditorPageProps>> {
  const id = getIdFromRequest(context)

  const userData = await prisma.user.findUnique({
    select: {
      email: true,
      firstName: true,
      id: true,
      isActive: true,
      lastName: true,
      role: true,
    },
    where: {
      id,
    },
  })
  if (!userData) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      userData,
    },
  }
}
