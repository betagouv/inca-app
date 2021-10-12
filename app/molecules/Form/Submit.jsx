import { Button } from '@ivangabriele/singularity'
import { useFormikContext } from 'formik'

export default function Submit({ children }) {
  const { isSubmitting } = useFormikContext()

  return (
    <Button disabled={isSubmitting} type="submit">
      {children}
    </Button>
  )
}
