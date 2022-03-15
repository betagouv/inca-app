import { Button, Card, Table } from '@singularity/core'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import DeletionModal from '../organisms/DeletionModal'

const BASE_COLUMNS = [
  {
    isSortable: true,
    key: 'label',
    label: 'Étiquette',
  },
  {
    isSortable: false,
    key: 'description',
    label: 'Description',
  },
]

export default function ContactCategoryList() {
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contactCategories, setContactCategories] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadContactCategories = async () => {
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
    loadContactCategories()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeContactCategoryDeletionModal = () => {
    setHasDeletionModal(false)
  }

  const confirmContactCategoryDeletion = async id => {
    const contactCategory = R.find(R.propEq('id', id))(contactCategories)

    setSelectedId(id)
    setSelectedEntity(contactCategory.label)
    setHasDeletionModal(true)
  }

  const deleteContactCategory = async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`contact-category/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadContactCategories()
  }

  const goToContactCategoryditor = id => {
    navigate.push(`/contact-category/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToContactCategoryditor,
      Icon: Edit,
      label: 'Éditer cette catégorie de contact',
      type: 'action',
    },
    {
      accent: 'danger',
      action: confirmContactCategoryDeletion,
      Icon: Trash,
      label: 'Supprimer cette catégorie de contact',
      type: 'action',
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Catégories de contact</Title>

        <Button onClick={() => goToContactCategoryditor('new')} size="small">
          Ajouter une catégorie de contact
        </Button>
      </AdminHeader>

      <Card>
        <Table columns={columns} data={contactCategories} defaultSortedKey="label" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && (
        <DeletionModal
          entity={selectedEntity}
          onCancel={closeContactCategoryDeletionModal}
          onConfirm={deleteContactCategory}
        />
      )}
    </AdminBox>
  )
}
