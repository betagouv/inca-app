import AdminHeader from '@app/atoms/AdminHeader'
import Card from '@app/atoms/Card'
import Field from '@app/atoms/Field'
import Subtitle from '@app/atoms/Subtitle'
import Title from '@app/atoms/Title'
import { capitalizeFirstLetter } from '@app/helpers/capitalizeFirstLetter'
import { useApi } from '@app/hooks/useApi'
import Form from '@app/molecules/Form'
import DeletionModal from '@app/organisms/DeletionModal'
import { dayjs } from '@common/libs/dayjs'
import { SettingKey } from '@prisma/client'
import { Button, Table } from '@singularity/core'
import * as R from 'ramda'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Trash } from 'react-feather'
import { toast } from 'react-toastify'
import * as Yup from 'yup'

import type { Setting, Synchronization } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const FormSchema = Yup.object().shape({})

const BASE_COLUMNS: TableColumnProps[] = [
  {
    isSortable: false,
    key: 'createdAt',
    label: 'Date',
    transform: ({ createdAt }) => capitalizeFirstLetter(dayjs().to(createdAt)),
  },
  {
    isSortable: false,
    key: 'user.email',
    label: 'Par',
  },
]

export default function AdminSynchronizationPage() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isLoadingSyncronizations, setIsLoadingSyncronizations] = useState(true)
  const [initialSettingsAsValues, setInitialSettingsAsValues] = useState<any>({})
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [synchronizations, setSynchronizations] = useState<Synchronization[]>([])
  const api = useApi()

  const load = useCallback(async () => {
    const maybeBody = await api.get<Synchronization[]>('synchronizations')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setSynchronizations(maybeBody.data)
    setIsLoadingSyncronizations(false)
  }, [api])

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const createSynchronization = async () => {
    setIsLoadingSyncronizations(true)

    const maybeBody = await api.post('synchronizations', {})
    if (maybeBody !== null && maybeBody.hasError) {
      toast.error(`Une erreur est survenue.`)
      toast.error(maybeBody.message)

      setIsLoadingSyncronizations(false)

      return
    }

    if (maybeBody === null) {
      toast.info(`Aucune nouvelle soumission à synchroniser.`)

      setIsLoadingSyncronizations(false)

      return
    }

    await load()

    toast.success(`Synchronisation réussie.`)
  }

  const confirmSynchronizationDeletion = useCallback(
    async id => {
      const synchronization = R.find<Synchronization>(R.propEq('id', id))(synchronizations)
      if (!synchronization) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(`la synchronisation du ${dayjs(synchronization.createdAt).format('LL à LT')}`)
      setHasDeletionModal(true)
    },
    [synchronizations],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const deleteSynchronization = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`synchronizations/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [api, load, selectedId])

  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true)

    const maybeBody = await api.get<Setting[]>('settings')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    const settingsAsRecord = R.fromPairs(maybeBody.data.map(({ key, value }) => [key, value]))

    setInitialSettingsAsValues(settingsAsRecord)
    setIsLoadingSettings(false)
  }, [api])

  const updateSettings = useCallback(
    async (values: any, { setErrors, setSubmitting }) => {
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

      loadSettings()

      setSubmitting(false)

      toast.success(`Paramètres mis à joure.`)
    },
    [api, loadSettings],
  )

  useEffect(() => {
    loadSettings()
    load()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo(
    () =>
      [
        ...BASE_COLUMNS,
        {
          accent: 'danger',
          action: confirmSynchronizationDeletion,
          Icon: Trash,
          key: 'confirmSynchronizationDeletion',
          label: 'Supprimer cette catégorie de contact',
          type: 'action',
        },
      ] as TableColumnProps[],
    [confirmSynchronizationDeletion],
  )

  return (
    <>
      <AdminHeader>
        <Title>Synchronisations</Title>

        <Button onClick={createSynchronization}>Synchroniser</Button>
      </AdminHeader>

      <Card>
        <Subtitle>Historique</Subtitle>
        <Table
          columns={columns}
          data={synchronizations}
          defaultSortedKey="createdAt"
          defaultSortedKeyIsDesc
          isLoading={isLoadingSyncronizations}
        />
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

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={deleteSynchronization} />
      )}
    </>
  )
}
