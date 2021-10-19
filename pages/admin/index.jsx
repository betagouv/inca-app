import { BrowserRouter, Switch, Route } from 'react-router-dom'
import styled from 'styled-components'

import useAuth from '../../app/hooks/useAuth'
import LoginModal from '../../app/organisms/LoginModal'
import Menu from '../../app/organisms/Menu'
import ContributorEditor from '../../app/templates/ContributorEditor'
import ContributorList from '../../app/templates/ContributorList'
import LeadList from '../../app/templates/LeadList'
import OrganizationList from '../../app/templates/OrganizationList'
import ProjectBoard from '../../app/templates/ProjectBoard'
import ProjectEditor from '../../app/templates/ProjectEditor'
import ProjectLinker from '../../app/templates/ProjectLinker'
import ProjectList from '../../app/templates/ProjectList'
import UserEditor from '../../app/templates/UserEditor'
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
  const { state: authState, user } = useAuth()

  if (authState.isLoading) {
    return <h2>Loading...</h2>
  }

  if (!authState.isAuthenticated || user === null) {
    return <LoginModal />
  }

  return (
    <>
      <BrowserRouter basename="/admin">
        <Page>
          <Menu />

          <Body>
            <Main>
              <Switch>
                <Route exact path="/">
                  <ProjectBoard />
                </Route>

                <Route path="/contributors">
                  <ContributorList />
                </Route>
                <Route path="/contributor/:id">
                  <ContributorEditor />
                </Route>

                <Route path="/leads">
                  <LeadList />
                </Route>

                <Route path="/organizations">
                  <OrganizationList />
                </Route>

                <Route path="/projects">
                  <ProjectList />
                </Route>
                <Route path="/project/linker/:id">
                  <ProjectLinker />
                </Route>
                <Route path="/project/:id">
                  <ProjectEditor />
                </Route>

                <Route path="/users">
                  <UserList />
                </Route>
                <Route path="/user/:id">
                  <UserEditor />
                </Route>

                <Route path="*">
                  <div>404</div>
                </Route>
              </Switch>
            </Main>
          </Body>
        </Page>
      </BrowserRouter>
    </>
  )
}
