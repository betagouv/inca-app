import { useState, useEffect } from 'react'
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

function TellMeConnection() {
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadTellMeInfo = async () => {
    const maybeBody = await api.get('tell-me')
    if (isMounted()) {
      // TODO: chelou - fix that ?
      setInitialValues(maybeBody.data)
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

  const synchronize = async () => {}

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
