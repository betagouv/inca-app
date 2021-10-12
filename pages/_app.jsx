import { GlobalStyle, ThemeProvider } from '@ivangabriele/singularity'
import Head from 'next/head'
import { useRouter } from 'next/router'

import withApi from '../app/hocs/withApi'
import withAuth from '../app/hocs/withAuth'

import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'

export default function LabAgoraApp({ Component, pageProps }) {
  const WrappedComponent = withAuth(withApi(Component))
  const { pathname } = useRouter()

  if (pathname.startsWith('/admin') && !process.browser) {
    return <div suppressHydrationWarning />
  }

  return (
    <div suppressHydrationWarning>
      <Head>
        <title>Lab Agora</title>

        <meta content="initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <ThemeProvider>
        <GlobalStyle />

        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...pageProps} />
      </ThemeProvider>
    </div>
  )
}
