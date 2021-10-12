import { TextInput } from '@ivangabriele/singularity'
import { useFormikContext } from 'formik'
import PropTypes from 'prop-types'

export default function Input({ autoComplete, helper, isDisabled, label, name, onChange, type }) {
  const { errors, handleChange, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])

  const handleFinalChange = event => {
    if (onChange !== null) {
      onChange(event)
    }

    handleChange(event)
  }

  return (
    <TextInput
      autoComplete={String(autoComplete)}
      defaultValue={values[name]}
      disabled={isDisabled}
      error={hasError && errors[name]}
      helper={helper}
      name={name}
      onChange={handleFinalChange}
      placeholder={label}
      type={type}
    />
  )
}

Input.defaultProps = {
  autoComplete: null,
  helper: ' ',
  isDisabled: false,
  onChange: null,
  type: 'text',
}

Input.propTypes = {
  autoComplete: PropTypes.string,
  helper: PropTypes.string,
  isDisabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  type: PropTypes.string,
}
