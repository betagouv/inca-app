import { Textarea as SingularityTextarea, TextareaProps as SingularityTextareaProps } from '@singularity/core'
import { useFormikContext } from 'formik'

type TextareaProps = SingularityTextareaProps & {
  name: string
}
export function Textarea({ disabled, name, ...rest }: TextareaProps) {
  const { errors, handleChange, isSubmitting, submitCount, touched, values } =
    useFormikContext<Record<string, string | number>>()

  const controlledDisabled = disabled || isSubmitting
  const defaultValue = values[name]
  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? String(errors[name]) : undefined

  return (
    <SingularityTextarea
      defaultValue={defaultValue}
      disabled={controlledDisabled}
      error={maybeError}
      name={name}
      onChange={handleChange}
      {...rest}
    />
  )
}
