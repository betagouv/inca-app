import { Temporal } from '@js-temporal/polyfill'
import { Table } from '@singularity/core'
import { useState, useEffect } from 'react'
import { CheckCircle, X } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Card from '../atoms/Card'
import Field from '../atoms/Field'
import Subtitle from '../atoms/Subtitle'
import Title from '../atoms/Title'
import { useApi } from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import Form from '../molecules/Form'

import type { TableColumnProps } from '@singularity/core'

const FormSchema = Yup.object().shape({})

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: true,
    key: 'createdAt',
    label: 'Date',
    transform: ({ createdAt }) => Temporal.Instant.from(createdAt).toLocaleString('fr-FR'),
  },
  {
    isSortable: true,
    key: 'user.email',
    label: 'Par',
  },
  {
    isSortable: false,
    key: 'info',
    label: 'Informations',
  },
  {
    IconOff: X,
    IconOn: CheckCircle,
    key: 'success',
    label: 'Statut',
    labelOff: 'Erreur',
    labelOn: 'Succès',
    type: 'boolean',
    withTooltip: true,
  },
]

function TellMeConnection() {
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<any>(null)
  const [synchronizations, setSynchronizations] = useState([])

  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadTellMeInfo = async () => {
    const maybeBody: any = await api.get('tell-me')
    if (isMounted()) {
      // TODO: chelou - fix that ?
      setInitialValues(maybeBody.data.parameters)
      setSynchronizations(maybeBody.data.lastSynchronizations)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTellMeInfo()
  }, [])

  const updateTellMeSettingsAndGoBack = async () => {
    // const updateTellMeSettingsAndGoBack = async (values, { setErrors, setSubmitting }) => {
    // if (false) {
    //   setErrors({
    //     email: 'Sorry, but something went wrong.',
    //   })
    //   setSubmitting(false)

    //   return
    // }
    navigate('..')
  }

  const synchronize = async (_, { setErrors, setSubmitting }) => {
    const maybeBody = await api.post('tell-me/synchronize', {})
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      if (maybeBody !== null) {
        toast.error(`La synchronisation a échouée : ${maybeBody.message}`)
      }

      return
    }
    toast.success(`Synchronisation terminée !`)
    await loadTellMeInfo()
  }

  const columns = [...BASE_COLUMNS]

  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Administration de la synchronisation Tell Me</Title>
      </AdminHeader>

      <Card>
        <Subtitle>Synchronisation</Subtitle>
        <Table
          columns={columns}
          data={synchronizations}
          defaultSortedKey="createdAt"
          defaultSortedKeyIsDesc
          isLoading={isLoading}
        />
        <Form onSubmit={synchronize} validationSchema={FormSchema}>
          <Field>
            <Form.Submit>Synchroniser</Form.Submit>
          </Field>
        </Form>
      </Card>

      <Card>
        <Subtitle>Paramètres</Subtitle>
        <Form initialValues={initialValues} onSubmit={updateTellMeSettingsAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input isDisabled label="URL de l'API TellMe" name="apiUrl" />
          </Field>
          <Field>
            <Form.Input isDisabled label="ID TellMe du formulaire contributeur" name="contributorSurveyId" />
          </Field>
          <Field>
            <Form.Input isDisabled label="ID TellMe du formulaire projet" name="projectSurveyId" />
          </Field>
          <Field>
            <Form.Input isDisabled label="Organisation LabAgora attribuée par défault" name="defaultOrganizationId" />
          </Field>
          <Field>
            <Form.Input isDisabled label="Utilisateur LabAgora attribué par défault" name="defaultUserId" />
          </Field>
          <Field>
            <Form.Submit>Enregistrer</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}

export { TellMeConnection }
