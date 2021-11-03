import { GlobalStyle, ThemeProvider } from '@singularity-ui/core'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { createGlobalStyle } from 'styled-components'

import withApi from '../app/hocs/withApi'
import withAuth from '../app/hocs/withAuth'

import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'

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

export default function LabAgoraApp({ Component, pageProps }) {
  const { pathname } = useRouter()

  const WrappedComponent = withAuth(withApi(Component))

  if (pathname.startsWith('/admin') && !process.browser) {
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

        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...pageProps} />
      </ThemeProvider>
    </div>
  )
}
