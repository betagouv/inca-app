import styled from 'styled-components'
import * as Yup from 'yup'

import Title from '../atoms/Title'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import Form from '../molecules/Form'

const Box = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;
`

const LoginBox = styled.div`
  border-radius: 0.75rem;
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.05);
  display: flex;
  height: 30rem;
  width: 60rem;
`

const BodyBox = styled.div`
  background-color: white;
  border-bottom-left-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  max-width: 50%;
  padding: calc(${p => p.theme.padding.layout.large} * 2);
`

const SideBox = styled.div`
  background-color: #efeff1;
  background-image: url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3870&q=80');
  background-size: cover;
  border-bottom-right-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  flex-grow: 1;
  max-width: 50%;
  opacity: 0.5;
`

const Intro = styled.div`
  > p {
    margin-top: ${p => p.theme.padding.layout.small};
  }
`

const Field = styled.div`
  padding-top: ${p => p.theme.padding.layout.medium};
`

const FormSchema = Yup.object().shape({
  email: Yup.string()
    .required(`Veuillez indiquer votre email.`)
    .email(`Cet email ne semble pas correctement formatté.`),
  password: Yup.string().required(`Veuillez indiquer votre mot de passe.`),
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
        email: 'Il semble que le serveur ait mal répondu.',
      })
      setSubmitting(false)

      return
    }

    if (body.hasError) {
      if (body.code === 401) {
        setErrors({
          email: 'Email et/ou mot de passe erronés.',
          password: 'Email et/ou mot de passe erronés.',
        })
        setSubmitting(false)

        return
      }

      if (body.code === 403) {
        setErrors({
          email: 'Votre compte n’est pas (encore) activé.',
        })
        setSubmitting(false)

        return
      }
    }

    await logIn(body.data.sessionToken, body.data.refreshToken)
  }

  return (
    <Box>
      <LoginBox>
        <BodyBox>
          <div>
            <Title>Bienvenue sur Lab Agora !</Title>
            <Intro>
              <p>
                Cet espace sert à orchestrer les mises en relation entre contributeurs et projets contribuant à la lutte
                contre les cancers.
              </p>
            </Intro>
          </div>

          <Form
            autoComplete
            initialValues={formInitialValues}
            onSubmit={getSessionJwtAndLogIn}
            validationSchema={FormSchema}
          >
            <Field>
              <Form.Input autoComplete="email" label="Email" name="email" noLabel type="email" />
            </Field>
            <Field>
              <Form.Input
                autoComplete="current-password"
                label="Mot de passe"
                name="password"
                noLabel
                type="password"
              />
            </Field>

            <Field>
              <Form.Submit>Se connecter</Form.Submit>
            </Field>
          </Form>
        </BodyBox>

        <SideBox />
      </LoginBox>
    </Box>
  )
}
