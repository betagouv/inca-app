import { Select as SingularitySelect } from '@ivangabriele/singularity'
import { useFormikContext } from 'formik'
import PropTypes from 'prop-types'
import * as R from 'ramda'

export default function Select({ helper, isDisabled, label, name, options }) {
  const { errors, setFieldValue, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? errors[name] : null
  const defaultValue = values[name] !== undefined ? R.find(R.propEq('value', values[name]))(options) : null

  const updateFormikValues = ({ value }) => {
    setFieldValue(name, value)
  }

  return (
    <SingularitySelect
      defaultValue={defaultValue}
      disabled={isDisabled}
      error={maybeError}
      helper={helper}
      name={name}
      onChange={updateFormikValues}
      options={options}
      placeholder={label}
    />
  )
}

Select.defaultProps = {
  helper: ' ',
  isDisabled: false,
}

Select.propTypes = {
  helper: PropTypes.string,
  isDisabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array.isRequired,
}
