import { Button, Dialog } from '@singularity-ui/core'
import BetterPropTypes from 'better-prop-types'

export default function DeletionModal({ entity, onCancel, onConfirm }) {
  return (
    <Dialog>
      <Dialog.Body>
        <Dialog.Title>Confirmation de suppression</Dialog.Title>

        <p>
          Êtes-vous sûr de vouloir supprimer <strong>{entity}</strong> ?
        </p>
      </Dialog.Body>

      <Dialog.Action>
        <Button accent="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button accent="danger" onClick={onConfirm}>
          Supprimer
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

DeletionModal.propTypes = {
  entity: BetterPropTypes.string.isRequired,
  onCancel: BetterPropTypes.func.isRequired,
  onConfirm: BetterPropTypes.func.isRequired,
}
