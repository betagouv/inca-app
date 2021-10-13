import { useFormikContext } from 'formik'
import PropTypes from 'prop-types'

export default function Checkbox({ isDisabled, label, name }) {
  const { handleChange, values } = useFormikContext()

  const isChecked = Boolean(values[name])

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label>
      <input checked={isChecked} disabled={isDisabled} name={name} onChange={handleChange} type="checkbox" /> {label}
    </label>
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
