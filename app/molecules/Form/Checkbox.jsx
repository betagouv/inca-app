import { Checkbox as SingularityCheckbox } from '@ivangabriele/singularity'
import { useFormikContext } from 'formik'
import PropTypes from 'prop-types'

export default function Checkbox({ isDisabled, label, name }) {
  const { handleChange, values } = useFormikContext()

  const isChecked = Boolean(values[name])

  return (
    <SingularityCheckbox
      defaultChecked={isChecked}
      disabled={isDisabled}
      label={label}
      name={name}
      onChange={handleChange}
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
