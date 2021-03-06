import { Button } from '@singularity/core'
import { useFormikContext } from 'formik'

export default function Submit({ children }) {
  const { isSubmitting } = useFormikContext()

  return (
    <Button disabled={isSubmitting} type="submit">
      {children}
    </Button>
  )
}
