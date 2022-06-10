import { BrowserRouter, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'

import useAuth from '../../app/hooks/useAuth'
import LoginModal from '../../app/organisms/LoginModal'
import Menu from '../../app/organisms/Menu'
import ContactCategoryEditor from '../../app/templates/ContactCategoryEditor'
import ContactCategoryList from '../../app/templates/ContactCategoryList'
import ContributorEditor from '../../app/templates/ContributorEditor'
import ContributorList from '../../app/templates/ContributorList'
import LeadEditor from '../../app/templates/LeadEditor'
import LeadList from '../../app/templates/LeadList'
import OrganizationEditor from '../../app/templates/OrganizationEditor'
import OrganizationList from '../../app/templates/OrganizationList'
import ProjectBoard from '../../app/templates/ProjectBoard'
import ProjectEditor from '../../app/templates/ProjectEditor'
import ProjectLinker from '../../app/templates/ProjectLinker'
import ProjectList from '../../app/templates/ProjectList'
import ProspectEditor from '../../app/templates/ProspectEditor'
import ProspectList from '../../app/templates/ProspectList'
import { TellMeConnection } from '../../app/templates/TellMeConnection'
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
    <BrowserRouter basename="/admin">
      <Page>
        <Menu />

        <Body>
          <Main>
            <Routes>
              <Route element={<ProjectBoard />} index />

              <Route path="contact-categories">
                <Route element={<ContactCategoryList />} index />
                <Route element={<ContactCategoryEditor />} path=":id" />
              </Route>

              <Route path="contributors">
                <Route element={<ContributorList />} index />
                <Route element={<ContributorEditor />} path=":id" />
              </Route>

              <Route path="leads">
                <Route element={<LeadList />} index />
                <Route element={<LeadEditor />} path=":id" />
              </Route>

              <Route path="organizations">
                <Route element={<OrganizationList />} index />
                <Route element={<OrganizationEditor />} path=":id" />
              </Route>

              <Route path="projects">
                <Route element={<ProjectList />} index />
                <Route element={<ProjectLinker />} path="linker/:id" />
                <Route element={<ProjectEditor />} path=":id" />
              </Route>

              <Route path="prospects">
                <Route element={<ProspectList />} index />
                <Route element={<ProspectEditor />} path=":id" />
              </Route>

              <Route path="users">
                <Route element={<UserList />} index />
                <Route element={<UserEditor />} path=":id" />
              </Route>

              <Route path="tell-me">
                <Route element={<TellMeConnection />} index />
              </Route>

              <Route element={<div>404</div>} path="*" />
            </Routes>
          </Main>
        </Body>
      </Page>
    </BrowserRouter>
  )
}
