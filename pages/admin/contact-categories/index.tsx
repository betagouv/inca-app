import { prisma } from '@api/libs/prisma'
import AdminHeader from '@app/atoms/AdminHeader'
import Title from '@app/atoms/Title'
import { useApi } from '@app/hooks/useApi'
import DeletionModal from '@app/organisms/DeletionModal'
import { Button, Card, Table } from '@singularity/core'
import { useRouter } from 'next/router'
import * as R from 'ramda'
import { useCallback, useMemo, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { toast } from 'react-toastify'
import superjson from 'superjson'

import type { ContactCategory } from '@prisma/client'
import type { TableColumnProps } from '@singularity/core'
import type { GetServerSidePropsResult } from 'next'

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

type AdminContactCategoryListPageProps = {
  SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY: string
  initialContactCategoriesAsSuperJson: string
}
export default function AdminContactCategoryListPage({
  initialContactCategoriesAsSuperJson,
  SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
}: AdminContactCategoryListPageProps) {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contactCategories, setContactCategories] = useState<ContactCategory[]>(
    superjson.parse(initialContactCategoriesAsSuperJson),
  )
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const router = useRouter()
  const api = useApi()

  const load = useCallback(async () => {
    setIsLoading(true)

    const maybeBody = await api.get('contact-categories')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    setContactCategories(maybeBody.data)
    setIsLoading(false)
  }, [api])

  const closeDeletionModal = useCallback(() => {
    setHasDeletionModal(false)
  }, [])

  const confirmDeletion = useCallback(
    async id => {
      const contactCategory = R.find<ContactCategory>(R.propEq('id', id))(contactCategories)
      if (!contactCategory) {
        return
      }

      if (contactCategory.label === SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY) {
        toast.warn(
          `La catégorie de contact "${SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY}" est protégée.` +
            'Vous ne pouvez pas la supprimer.',
        )

        return
      }

      setSelectedId(id)
      setSelectedEntity(contactCategory.label)
      setHasDeletionModal(true)
    },
    [contactCategories, SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY],
  )

  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
  const _delete = useCallback(async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`contact-categories/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await load()
  }, [api, load, selectedId])

  const goToEditor = useCallback(
    id => {
      router.push(`/admin/contact-categories/${id}`)
    },
    [router],
  )

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
    <>
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
    </>
  )
}

export async function getServerSideProps(): Promise<GetServerSidePropsResult<AdminContactCategoryListPageProps>> {
  const { SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY } = process.env
  if (!SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY) {
    console.error('Fatal: `SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY` env is undefined.')
    process.exit(1)
  }

  const contactCategories = await prisma.contactCategory.findMany({
    orderBy: {
      label: 'desc',
    },
  })
  const initialContactCategoriesAsSuperJson = superjson.stringify(contactCategories)

  return {
    props: {
      initialContactCategoriesAsSuperJson,
      SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
    },
  }
}
