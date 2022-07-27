import { TextInput } from '@singularity/core'
import { useFormikContext } from 'formik'

import type { TextInputProps } from '@singularity/core'

type CustomTextInputProps = TextInputProps & {
  name: string
  noLabel?: boolean
}
export default function Input({
  disabled,
  label,
  name,
  noLabel = false,
  type = 'text',
  ...rest
}: CustomTextInputProps) {
  const { errors, handleChange, isSubmitting, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const isDisabled = disabled || isSubmitting
  const maybeError = hasError ? errors[name] : undefined

  return (
    <TextInput
      defaultValue={(values as any)[name]}
      disabled={isDisabled}
      error={maybeError}
      label={noLabel ? undefined : label}
      name={name}
      onChange={handleChange}
      placeholder={noLabel ? label : undefined}
      type={type}
      {...rest}
    />
  )
}
