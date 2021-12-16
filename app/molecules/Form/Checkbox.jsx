import { Checkbox as SingularityCheckbox } from '@singularity/core'
import PropTypes from 'better-prop-types'
import { useFormikContext } from 'formik'

export default function Checkbox({ isDisabled, label, name }) {
  const { setFieldValue, values } = useFormikContext()

  const isChecked = Boolean(values[name])

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

Checkbox.propTypes = {
  isDisabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}
