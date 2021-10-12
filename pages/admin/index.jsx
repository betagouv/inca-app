import { BrowserRouter, Switch, Route } from 'react-router-dom'
import styled from 'styled-components'

import useAuth from '../../app/hooks/useAuth'
import LoginModal from '../../app/organisms/LoginModal'
import Board from '../../app/templates/Board'
import UserList from '../../app/templates/UserList'

const Page = styled.div`
  display: flex;
  flex-grow: 1;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Main = styled.main`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

/**
 * Lab Agora Back-Office
 *
 * @description
 * This is the main application served as a SPA while generated surveys are served as SSR to optimize their rendering.
 *
 * @see https://colinhacks.com/essays/building-a-spa-with-nextjs
 */
export default function AdminSpaPage() {
  const { state: authState } = useAuth()

  if (authState.isLoading) {
    return <h2>Loading...</h2>
  }

  if (!authState.isAuthenticated) {
    return <LoginModal />
  }

  return (
    <>
      <BrowserRouter basename="/admin">
        <Page>
          <Body>
            <Main>
              <Switch>
                <Route path="/users">
                  <UserList />
                </Route>
                <Route path="/">
                  <Board />
                </Route>
              </Switch>
            </Main>
          </Body>
        </Page>
      </BrowserRouter>
    </>
  )
}
