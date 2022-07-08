import { Textarea as SingularityTextarea } from '@singularity/core'
import { useFormikContext } from 'formik'

export default function Textarea({ helper, isDisabled, label, name }) {
  const { errors, handleChange, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? errors[name] : undefined

  return (
    <SingularityTextarea
      defaultValue={(values as any)[name]}
      disabled={isDisabled}
      error={maybeError}
      helper={helper}
      label={label}
      name={name}
      onChange={handleChange}
    />
  )
}

Textarea.defaultProps = {
  helper: ' ',
  isDisabled: false,
  type: 'text',
}
