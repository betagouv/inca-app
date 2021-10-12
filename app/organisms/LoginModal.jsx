import * as Yup from 'yup'

import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import Form from '../molecules/Form'

const FormSchema = Yup.object().shape({
  email: Yup.string().required(`Please enter your email address.`).email(`This email doesn't look well formatted.`),
  password: Yup.string().required(`Please enter your password.`),
})

export default function LoginModal() {
  const api = useApi()
  const { logIn, user } = useAuth()
  const hasUserEmail = user?.email !== undefined

  const formInitialValues = {
    email: hasUserEmail ? user.email : '',
    password: '',
  }

  const getSessionJwtAndLogIn = async (values, { setErrors, setSubmitting }) => {
    const body = await api.post('auth/login', values)
    if (body === null) {
      setErrors({
        email: 'Sorry, but something went wrong.',
      })
      setSubmitting(false)

      return
    }

    if (body.hasError) {
      if (body.code === 401) {
        setErrors({
          email: 'Wrong email and/or password.',
          password: 'Wrong email and/or password.',
        })
        setSubmitting(false)

        return
      }

      if (body.code === 403) {
        setErrors({
          email: 'Your account is not active.',
        })
        setSubmitting(false)

        return
      }
    }

    await logIn(body.data.sessionToken, body.data.refreshToken)
  }

  return (
    <div>
      <h2>Log In</h2>

      <Form
        autoComplete
        initialValues={formInitialValues}
        onSubmit={getSessionJwtAndLogIn}
        validationSchema={FormSchema}
      >
        <Form.Input autoComplete="email" label="Email" name="email" type="email" />
        <Form.Input autoComplete="current-password" label="Password" name="password" type="password" />

        <Form.Submit>Log In</Form.Submit>
      </Form>
    </div>
  )
}
