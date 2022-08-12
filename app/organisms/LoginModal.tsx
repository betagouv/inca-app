import { ButtonAsLink } from '@app/atoms/ButtonAsLink'
import { NexauthError, useAuth } from 'nexauth/client'
import { useState } from 'react'
import styled from 'styled-components'
import * as Yup from 'yup'

import Title from '../atoms/Title'
import Form from '../molecules/Form'

import type { User } from '@prisma/client'
import type { FormikHelpers } from 'formik'

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
  max-width: 60%;
  padding: ${p => p.theme.padding.layout.large};
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

const LoginFormSchema = Yup.object().shape({
  logInEmail: Yup.string()
    .required(`Veuillez indiquer votre email.`)
    .email(`Cet email ne semble pas correctement formatté.`),
  logInPassword: Yup.string().required(`Veuillez indiquer votre mot de passe.`),
})

const SignupFormSchema = Yup.object().shape({
  signUpEmail: Yup.string()
    .required(`Veuillez indiquer votre email.`)
    .email(`Cet email ne semble pas correctement formatté.`),
  signUpPassword: Yup.string().required(`Veuillez indiquer votre mot de passe.`),
  signUpPasswordConfirmation: Yup.string()
    .required(`Veuillez confirmer votre mot de passe.`)
    .oneOf([Yup.ref('signUpPassword')], 'Les mots de passe ne correspondent pas.'),
})

type LogInValues = {
  logInEmail: string
  logInPassword: string
}

type SignUpValues = {
  signUpEmail: string
  signUpPassword: string
  signUpPasswordConfirmation: string
}

enum SignInDialogType {
  LOG_IN,
  SIGN_UP,
}

export default function LoginModal() {
  const [type, setType] = useState(SignInDialogType.LOG_IN)
  const auth = useAuth<User>()

  const logIn = async (values: LogInValues, { setErrors, setSubmitting }: FormikHelpers<LogInValues>) => {
    try {
      const { logInEmail, logInPassword } = values

      const res = await auth.logIn(logInEmail, logInPassword)
      if (res.isError) {
        if (res.error.email !== undefined) {
          switch (res.error.email) {
            case NexauthError.LOG_IN_WRONG_EMAIL_OR_PASSWORD:
              setErrors({
                logInEmail: 'Mauvais email et/ou mot de passe.',
              })
              break

            case NexauthError.LOG_IN_UNACCEPTABLE_CONDITION:
              setErrors({
                logInEmail: 'Ce compte est inactif.',
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

  const signUp = async (values: SignUpValues, { setErrors, setSubmitting }: FormikHelpers<SignUpValues>) => {
    try {
      const { signUpEmail: email, signUpPassword: password } = values

      const res = await auth.signUp({
        email: email.trim().toLocaleLowerCase(),
        password,
      })
      if (res.isError) {
        if (res.error.email !== undefined) {
          switch (res.error.email) {
            case NexauthError.SIGN_UP_DUPLICATE_EMAIL:
              setErrors({
                signUpEmail: 'Cet email est déjà associé à un compte.',
              })
              break

            default:
              setErrors({
                signUpEmail: JSON.stringify(res.error),
              })
              // eslint-disable-next-line no-console
              console.error(res.error)
          }
        } else {
          // eslint-disable-next-line no-console
          console.error(res.error)
        }

        setSubmitting(false)

        return
      }

      switchToLogIn()
    } catch (err) {
      console.error(err)
    }
  }

  const switchToLogIn = () => {
    setType(SignInDialogType.LOG_IN)
  }

  const switchToSignUp = () => {
    setType(SignInDialogType.SIGN_UP)
  }

  if (type === SignInDialogType.LOG_IN) {
    return (
      <Box>
        <LoginBox>
          <BodyBox>
            <div>
              <Title>Bienvenue sur Lab Agora !</Title>
              <Intro>
                <p>
                  Cet espace sert à orchestrer les mises en relation entre contributeurs et projets contribuant à la
                  lutte contre les cancers.
                </p>
                <p>
                  Vous pouvez <ButtonAsLink onClick={switchToSignUp}>demander un compte</ButtonAsLink> si cela vous
                  concerne.
                </p>
              </Intro>
            </div>

            <Form key="form-login" autoComplete onSubmit={logIn} validationSchema={LoginFormSchema}>
              <Field>
                <Form.Input autoComplete="email" label="Email" name="logInEmail" noLabel type="email" />
              </Field>
              <Field>
                <Form.Input
                  autoComplete="current-password"
                  label="Mot de passe"
                  name="logInPassword"
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

  return (
    <Box>
      <LoginBox>
        <BodyBox>
          <div>
            <Title>
              Demande d’ouverture
              <br />
              d’un compte de gestion
            </Title>
            <Intro>
              <p>
                Une fois votre demande envoyée, vous devrez attendre que votre compte soit activé pour pouvoir vous
                connecter.
              </p>
            </Intro>
          </div>

          <Form key="form-signup" autoComplete onSubmit={signUp} validationSchema={SignupFormSchema}>
            <Field>
              <Form.Input autoComplete="email" label="Email" name="signUpEmail" noLabel type="email" />
            </Field>
            <Field>
              <Form.Input
                autoComplete="new-password"
                label="Mot de passe"
                name="signUpPassword"
                noLabel
                type="password"
              />
            </Field>
            <Field>
              <Form.Input
                autoComplete="new-password"
                label="Mot de passe (répêter)"
                name="signUpPasswordConfirmation"
                noLabel
                type="password"
              />
            </Field>

            <Field>
              <Form.Submit>Demander mon inscription</Form.Submit>
            </Field>
          </Form>
        </BodyBox>

        <SideBox />
      </LoginBox>
    </Box>
  )
}
