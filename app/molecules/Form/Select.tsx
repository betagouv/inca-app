import { Select as SingularitySelect } from '@singularity/core'
import { useFormikContext } from 'formik'

export function Select({ helper, isAsync, isDisabled, isMulti, label, name, noLabel, options }) {
  const { errors, setFieldValue, submitCount, touched, values } = useFormikContext()

  const hasError = (touched[name] !== undefined || submitCount > 0) && Boolean(errors[name])
  const maybeError = hasError ? errors[name] : undefined

  const updateFormikValues = option => {
    setFieldValue(name, option)
  }

  return (
    <SingularitySelect
      cacheOptions={isAsync}
      defaultValue={(values as any)[name]}
      error={maybeError}
      helper={helper}
      isAsync={isAsync}
      isDisabled={isDisabled}
      isMulti={isMulti}
      label={!noLabel ? label : null}
      loadOptions={isAsync ? options : null}
      name={name}
      onChange={updateFormikValues}
      // onInputChange={isAsync ? updateFormikValues2 : null}
      options={!isAsync ? options : undefined}
      placeholder={noLabel ? label : null}
    />
  )
}

Select.defaultProps = {
  helper: ' ',
  isAsync: false,
  isDisabled: false,
  isMulti: false,
  noLabel: false,
}
