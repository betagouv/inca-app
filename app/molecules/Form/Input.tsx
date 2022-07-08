import { TextInput } from '@singularity/core'
import { useFormikContext } from 'formik'

export default function Input({ autoComplete, helper, isDisabled, label, name, noLabel, type }) {
  const { errors, handleChange, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? errors[name] : undefined

  return (
    <TextInput
      autoComplete={String(autoComplete)}
      defaultValue={(values as any)[name]}
      disabled={isDisabled}
      error={maybeError}
      helper={helper}
      label={!noLabel ? label : undefined}
      name={name}
      onChange={handleChange}
      placeholder={noLabel ? label : null}
      type={type}
    />
  )
}

Input.defaultProps = {
  autoComplete: null,
  helper: ' ',
  isDisabled: false,
  noLabel: false,
  type: 'text',
}
