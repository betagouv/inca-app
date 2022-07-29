import { Checkbox as SingularityCheckbox } from '@singularity/core'
import { useFormikContext } from 'formik'

export function Checkbox({ isDisabled, label, name }) {
  const { setFieldValue, values } = useFormikContext()

  const isChecked = Boolean((values as any)[name])

  const updateFormikValues = event => {
    setFieldValue(name, event.target.checked)
  }

  return (
    <SingularityCheckbox
      defaultChecked={isChecked}
      disabled={isDisabled}
      label={label}
      name={name}
      onChange={updateFormikValues}
    />
  )
}

Checkbox.defaultProps = {
  isDisabled: false,
}
