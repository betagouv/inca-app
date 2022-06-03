import Head from 'next/head'
import styled from 'styled-components'

function TitleAtom({ children }) {
  return (
    <>
      <Head>
        <title>Lab Agora | {children}</title>
      </Head>
      <h1>{children}</h1>
    </>
  )
}

const Title = styled(TitleAtom)`
  font-size: 150%;
  font-weight: 400;
`

export default Title
