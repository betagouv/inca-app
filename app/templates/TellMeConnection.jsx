import { Temporal } from '@js-temporal/polyfill'
import { Table } from '@singularity/core'
import { useState, useEffect } from 'react'
import { CheckCircle, X } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Card from '../atoms/Card'
import Field from '../atoms/Field'
import Subtitle from '../atoms/Subtitle'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import Form from '../molecules/Form'

const FormSchema = Yup.object().shape({
  // test: Yup.string(),
})

const BASE_COLUMNS = [
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
    isSortable: true,
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
  const [initialValues, setInitialValues] = useState(null)
  const [synchronizations, setSynchronizations] = useState([])

  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadTellMeInfo = async () => {
    const maybeBody = await api.get('tell-me')
    if (isMounted()) {
      // TODO: chelou - fix that ?
      setInitialValues(maybeBody.data.parameters)
      setSynchronizations(maybeBody.data.lastSynchronizations)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTellMeInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const maybeBody = await api.post('tell-me/synchronize')
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }
    await loadTellMeInfo()
  }

  const columns = [...BASE_COLUMNS]

  if (isLoading) {
    return 'Loading...'
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
        <Form onSubmit={synchronize}>
          <Field>
            <Form.Submit>Synchroniser</Form.Submit>
          </Field>
        </Form>
      </Card>

      <Card>
        <Subtitle>Paramètres</Subtitle>
        <Form initialValues={initialValues} onSubmit={updateTellMeSettingsAndGoBack} validationSchema={FormSchema}>
          <Field>
            <Form.Input isDisabled label="URL de l'API" name="apiUrl" />
          </Field>
          <Field>
            <Form.Input isDisabled label="Formulaire contributeur" name="contributorId" />
          </Field>
          <Field>
            <Form.Input isDisabled label="Formulaire projet" name="projectId" />
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
