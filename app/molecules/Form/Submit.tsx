import { Button } from '@singularity/core'
import { useFormikContext } from 'formik'

import type { ButtonProps } from '@singularity/core'

export function Submit({ disabled, ...rest }: ButtonProps) {
  const { isSubmitting } = useFormikContext()

  const controlledDisabled = disabled || isSubmitting

  return <Button disabled={controlledDisabled} type="submit" {...rest} />
}
