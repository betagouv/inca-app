import { withApi } from '@app/hocs/withApi'
import { Loader } from '@app/molecules/Loader'
import LoginModal from '@app/organisms/LoginModal'
import { GlobalStyle, ThemeProvider } from '@singularity/core'
import { AuthProvider } from 'nexauth/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { createGlobalStyle } from 'styled-components'

import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import 'react-toastify/dist/ReactToastify.css'

const GlobalStyleCustom = createGlobalStyle`
  html {
     display: flex;
    height: 100%;
  }

  body {
    line-height: 1.5;
  }

  body,
  #__next,
  #__laa {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
`
const PRIVATE_PATHS = [/^\/admin($|\/)/]

export default function LabAgoraApp({ Component, pageProps }) {
  const { pathname } = useRouter()

  const WrappedComponent = withApi(Component)

  if (pathname.startsWith('/admin') && typeof window === 'undefined') {
    return <div id="__laa" suppressHydrationWarning />
  }

  return (
    <div id="__laa" suppressHydrationWarning>
      <Head>
        <title>Lab Agora</title>

        <meta content="initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <ThemeProvider>
        <GlobalStyle />
        <GlobalStyleCustom />

        <AuthProvider Loader={Loader} privatePaths={PRIVATE_PATHS} SignInDialog={LoginModal}>
          <WrappedComponent {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}
