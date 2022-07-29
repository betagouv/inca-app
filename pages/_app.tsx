import { Body } from '@app/atoms/Body'
import { GlobalStyleCustom } from '@app/atoms/GlobalStyleCustom'
import { Loader } from '@app/atoms/Loader'
import { Main } from '@app/atoms/Main'
import { Page } from '@app/atoms/Page'
import { withApi } from '@app/hocs/withApi'
import LoginModal from '@app/organisms/LoginModal'
import Menu from '@app/organisms/Menu'
import { store } from '@app/store'
import { GlobalStyle, ThemeProvider } from '@singularity/core'
import { AuthProvider } from 'nexauth/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Provider as ReduxProvider } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import 'react-toastify/dist/ReactToastify.css'

const PRIVATE_PATHS = [/^\/admin($|\/)/]

export default function LabAgoraApp({ Component, pageProps }) {
  const { pathname } = useRouter()

  const isAdminSpace = pathname.startsWith('/admin')
  const WrappedComponent = withApi(Component)

  return (
    <>
      <Head>
        <title>Lab Agora</title>

        <meta content="initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <ThemeProvider>
        <GlobalStyle />
        <GlobalStyleCustom />

        <AuthProvider Loader={Loader} privatePaths={PRIVATE_PATHS} SignInDialog={LoginModal}>
          <ReduxProvider store={store}>
            {!isAdminSpace && <WrappedComponent {...pageProps} />}

            {isAdminSpace && (
              <Page>
                <Menu />

                <Body>
                  <Main>
                    <WrappedComponent {...pageProps} />
                  </Main>
                </Body>
              </Page>
            )}

            <ToastContainer autoClose={3000} position="bottom-right" />
          </ReduxProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}
