import AdminBox from '@app/atoms/AdminBox'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import useIsMounted from '@app/hooks/useIsMounted'
import DeletionModal from '@app/organisms/DeletionModal'
import { Button, Card, Table } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Trash } from 'react-feather'

import type { ContactCategory } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'

const BASE_COLUMNS: TableColumnProps[] = [
  {
    grow: 0.3,
    isSortable: true,
    key: 'label',
    label: 'Étiquette',
  },
  {
    grow: 0.3,
    isSortable: false,
    key: 'contributorSurveyAnswerValue',
    label: 'Réponse Tell Me (Contributeur·rices)',
  },
  {
    grow: 0.3,
    isSortable: false,
    key: 'leadSurveyAnswerValue',
    label: 'Réponse Tell Me (Porteur·ses)',
  },
]

export default function AdminContactCategoryListPage() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contactCategories, setContactCategories] = useState<ContactCategory[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const router = useRouter()
  const isMounted = useIsMounted()
  const api = useApi()

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    async id => {
      const contactCategory = R.find<ContactCategory>(R.propEq('id', id))(contactCategories)
      if (!contactCategory) {
        return
      }

      setSelectedId(id)
      setSelectedEntity(contactCategory.label)
      setHasDeletionModal(true)
    },
    [contactCategories],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`contact-category/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [selectedId])

  const goToEditor = useCallback(id => {
    router.push(`/admin/contact-categories/${id}`)
  }, [])

  const load = async () => {
    const maybeBody = await api.get('contact-categories')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setContactCategories(maybeBody.data)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const columns = useMemo(
    () => [
      ...BASE_COLUMNS,
      {
        accent: 'secondary',
        action: goToEditor,
        Icon: Edit,
        key: 'goToEditor',
        label: 'Éditer cette catégorie de contact',
        type: 'action',
      },
      {
        accent: 'danger',
        action: confirmDeletion,
        Icon: Trash,
        key: 'confirmDeletion',
        label: 'Supprimer cette catégorie de contact',
        type: 'action',
      },
    ],
    [confirmDeletion, goToEditor],
  )

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Catégories de contact</Title>

        <Button onClick={() => goToEditor('new')} size="small">
          Ajouter une catégorie de contact
        </Button>
      </AdminHeader>

      <Card>
        <Table columns={columns as any} data={contactCategories} defaultSortedKey="label" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && <DeletionModal entity={selectedEntity} onCancel={closeDeletionModal} onConfirm={_delete} />}
    </AdminBox>
  )
}
