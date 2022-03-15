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
              <Route element={<ProjectBoard />} exact path="/" />

              <Route element={<ContactCategoryList />} path="/contact-categories" />
              <Route element={<ContactCategoryEditor />} path="/contact-category/:id" />

              <Route element={<ContributorList />} path="/contributors" />
              <Route element={<ContributorEditor />} path="/contributor/:id" />

              <Route element={<LeadList />} path="/leads" />
              <Route element={<LeadEditor />} path="/lead/:id" />

              <Route element={<OrganizationList />} path="/organizations" />
              <Route element={<OrganizationEditor />} path="/organization/:id" />

              <Route element={<ProjectList />} path="/projects" />
              <Route element={<ProjectLinker />} path="/project/linker/:id" />
              <Route element={<ProjectEditor />} path="/project/:id" />

              <Route element={<ProspectList />} path="/prospects" />
              <Route element={<ProspectEditor />} path="/prospect/:id" />

              <Route element={<UserList />} path="/users" />
              <Route element={<UserEditor />} path="/user/:id" />

              <Route element={<div>404</div>} path="*" />
            </Routes>
          </Main>
        </Body>
      </Page>
    </BrowserRouter>
  )
}
