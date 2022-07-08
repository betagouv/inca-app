import { NexauthError, useAuth } from 'nexauth/client'
import styled from 'styled-components'
import * as Yup from 'yup'

import Title from '../atoms/Title'
import Form from '../molecules/Form'

import type { User } from '@prisma/client'

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
  const auth = useAuth<User>()

  const getSessionJwtAndLogIn = async (values, { setErrors, setSubmitting }) => {
    try {
      const { email, password } = values

      const res = await auth.logIn(email, password)
      if (res.isError) {
        if (res.error.email !== undefined) {
          switch (res.error.email) {
            case NexauthError.LOG_IN_WRONG_EMAIL_OR_PASSWORD:
              setErrors({
                email: 'Mauvais email et/ou mot de passe.',
              })
              break

            case NexauthError.LOG_IN_UNACCEPTABLE_CONDITION:
              setErrors({
                email: 'Ce compte est inactif.',
              })
              break

            default:
              console.error(res.error)
          }
        }

        setSubmitting(false)
      }
    } catch (err) {
      console.error(err)
    }
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

          <Form autoComplete onSubmit={getSessionJwtAndLogIn} validationSchema={FormSchema}>
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
