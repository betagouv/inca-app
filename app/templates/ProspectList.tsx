import { Button, Card, Table, TextInput } from '@singularity/core'
import debounce from 'lodash.debounce'
import * as R from 'ramda'
import { useEffect, useRef, useState } from 'react'
import { Edit, Trash } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import AdminBox from '../atoms/AdminBox'
import AdminHeader from '../atoms/AdminHeader'
import Title from '../atoms/Title'
import { useApi } from '../hooks/useApi'
import useIsMounted from '../hooks/useIsMounted'
import DeletionModal from '../organisms/DeletionModal'

/** @type {import('@singularity/core').TableColumnProps[]} */
const BASE_COLUMNS = [
  {
    isSortable: true,
    key: 'firstName',
    label: 'Prénom',
  },
  {
    isSortable: true,
    key: 'lastName',
    label: 'Nom',
  },
  {
    isSortable: true,
    key: 'organization',
    label: 'Organisation',
  },
  {
    isSortable: true,
    key: 'email',
    label: 'Email',
  },
  {
    isSortable: true,
    key: 'phone',
    label: 'Téléphone',
  },
  {
    isSortable: true,
    key: 'contactCategory.label',
    label: 'Catégorie',
  },
]

export default function ProspectList() {
  /** @type {React.MutableRefObject<HTMLInputElement | null>} */
  const $searchInput = useRef(null)
  const [hasDeletionModal, setHasDeletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prospects, setProspects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const navigate = useNavigate()
  const isMounted = useIsMounted()
  const api = useApi()

  const loadProspects = async () => {
    const maybeBody = await api.get('prospects')
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    if (isMounted()) {
      setProspects(maybeBody.data)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProspects()
  }, [])

  const closeProspectDeletionModal = () => {
    setHasDeletionModal(false)
  }

  const confirmProspectDeletion = async id => {
    const prospect = R.find(R.propEq('id', id))(prospects)

    setSelectedId(id)
    setSelectedEntity(`${prospect.firstName} ${prospect.lastName}`)
    setHasDeletionModal(true)
  }

  const deleteProspect = async () => {
    setHasDeletionModal(false)

    const maybeBody = await api.delete(`prospect/${selectedId}`)
    if (maybeBody === null || maybeBody.hasError) {
      return
    }

    await loadProspects()
  }

  const searchProspects = debounce(async () => {
    if ($searchInput.current === null) {
      return
    }

    setIsLoading(true)

    const query = ($searchInput.current as any).value
    const urlParams = new URLSearchParams({
      query,
    })
    const path = `prospects?${urlParams}`

    const maybeBody = await api.get(path)
    if (maybeBody === null || maybeBody.hasError) {
      if (isMounted()) {
        setIsLoading(false)
      }

      return
    }

    if (isMounted()) {
      setProspects(maybeBody.data)
      setIsLoading(false)
    }
  }, 250)

  const goToProspectEditor = id => {
    navigate(`/prospect/${id}`)
  }

  const columns = [
    ...BASE_COLUMNS,
    {
      accent: 'secondary',
      action: goToProspectEditor,
      Icon: Edit,
      key: 'goToProspectEditor',
      label: 'Éditer ce·tte prospect·e',
      type: 'action',
    },
    {
      accent: 'danger',
      action: confirmProspectDeletion,
      Icon: Trash,
      key: 'confirmProspectDeletion',
      label: 'Supprimer ce·tte prospect·e',
      type: 'action',
    },
  ]

  return (
    <AdminBox>
      <AdminHeader>
        <Title>Prospect·es</Title>

        <Button onClick={() => goToProspectEditor('new')} size="small">
          Ajouter un·e prospect·e
        </Button>
      </AdminHeader>

      <Card>
        <TextInput ref={$searchInput} onInput={searchProspects} placeholder="Rechercher un·e prospect·e" />

        <Table columns={columns as any} data={prospects} defaultSortedKey="lastName" isLoading={isLoading} />
      </Card>

      {hasDeletionModal && (
        <DeletionModal entity={selectedEntity} onCancel={closeProspectDeletionModal} onConfirm={deleteProspect} />
      )}
    </AdminBox>
  )
}
