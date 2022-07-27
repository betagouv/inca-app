import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Card from '@app/atoms/Card'
import Field from '@app/atoms/Field'
import Subtitle from '@app/atoms/Subtitle'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import { Temporal } from '@js-temporal/polyfill'
import { Setting, SettingKey } from '@prisma/client'
import { Table } from '@singularity/core'
import * as R from 'ramda'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, X } from 'react-feather'
import { toast } from 'react-toastify'
import * as Yup from 'yup'

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

export default function AdminSynchronizationPage() {
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isLoadingSyncronizations, setIsLoadingSyncronizations] = useState(true)
  const [initialSettingsAsValues, setInitialSettingsAsValues] = useState<any>({})
  const [synchronizations, setSynchronizations] = useState([])
  const api = useApi()

  const isLoading = isLoadingSettings || isLoadingSyncronizations

  const loadSettings = useCallback(async () => {
    const maybeBody = await api.get<Setting[]>('settings')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const settingsAsRecord = R.fromPairs(maybeBody.data.map(({ key, value }) => [key, value]))

    setInitialSettingsAsValues(settingsAsRecord)
    setIsLoadingSettings(false)
  }, [])

  const loadTellMeInfo = useCallback(async () => {
    const maybeBody: any = await api.get('tell-me')

    setSynchronizations(maybeBody.data.lastSynchronizations)
    setIsLoadingSyncronizations(false)
  }, [])

  const updateSettings = useCallback(async (values: any, { setErrors, setSubmitting }) => {
    const newSettingsAsRecord: any = R.pick([
      SettingKey.TELL_ME_CONTRIBUTOR_SURVEY_ID,
      SettingKey.TELL_ME_LEAD_SURVEY_ID,
      SettingKey.TELL_ME_PAT,
      SettingKey.TELL_ME_URL,
    ])(values)
    const newSettings = R.toPairs(newSettingsAsRecord).map(([key, value]) => ({
      key,
      value,
    }))

    const maybeBody = await api.patch('settings', newSettings)
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        [SettingKey.TELL_ME_URL]: 'Une erreur serveur est survenue.',
      })
    }

    setSubmitting(false)
  }, [])

  useEffect(() => {
    loadSettings()
    loadTellMeInfo()
  }, [])

  const synchronize = async (_, { setErrors, setSubmitting }) => {
    const maybeBody = await api.post('tell-me/synchronize', {})
    if (maybeBody === null || maybeBody.hasError) {
      setErrors({
        firstName: 'Une erreur serveur est survenue.',
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

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Synchronisation</Title>
      </AdminHeader>

      <Card>
        <Subtitle>Historique</Subtitle>
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
        <Subtitle>Paramètres Tell Me</Subtitle>
        <Form
          key={JSON.stringify(initialSettingsAsValues)}
          initialValues={initialSettingsAsValues}
          onSubmit={updateSettings}
          validationSchema={FormSchema}
        >
          <Field>
            <Form.Input
              disabled={isLoadingSettings}
              label="URL publique"
              name={SettingKey.TELL_ME_URL}
              placeholder="https://survey.lab-agora.fr"
            />
          </Field>
          <Field>
            <Form.Input
              disabled={isLoadingSettings}
              label="Jeton d'accès personnel"
              name={SettingKey.TELL_ME_PAT}
              type="password"
            />
          </Field>
          <Field>
            <Form.Input
              disabled={isLoadingSettings}
              label="ID du questionnaie contributeur·rice"
              name={SettingKey.TELL_ME_CONTRIBUTOR_SURVEY_ID}
            />
          </Field>
          <Field>
            <Form.Input
              disabled={isLoadingSettings}
              label="ID du questionnaire porteur·se"
              name={SettingKey.TELL_ME_LEAD_SURVEY_ID}
            />
          </Field>
          <Field>
            <Form.Submit>Enregistrer</Form.Submit>
          </Field>
        </Form>
      </Card>
    </AdminBox>
  )
}
