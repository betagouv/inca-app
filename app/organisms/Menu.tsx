import { Role } from '@prisma/client'
import { useAuth } from 'nexauth/client'
import Link from 'next/link'
import { LogOut } from 'react-feather'
import styled from 'styled-components'

import type { User } from '@prisma/client'

const Container = styled.div`
  background-color: #293042;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 16rem;
  padding: 0 ${p => p.theme.padding.layout.medium} ${p => p.theme.padding.layout.medium};
`

const Brand = styled.div`
  align-items: center;
  color: white;
  display: flex;
  height: 4rem;
  font-size: 1.25rem;
  justify-content: center;
  position: relative;
  text-transform: uppercase;

  &:before {
    background-color: rgba(255, 255, 255, 0.3);
    bottom: 0;
    content: ' ';
    height: 1px;
    left: 0;
    position: absolute;
    width: 100%;
  }
`

const MainMenu = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;

  > a {
    color: white;
    display: block;
    opacity: 0.75;
    padding: 0.5rem 0;
    text-decoration: none;

    :hover {
      opacity: 1;
    }
  }
`

const MainMenuTitle = styled.p`
  border-top: 1px solid ${p => p.theme.color.body.white};
  color: ${p => p.theme.color.body.white};
  font-size: 80%;
  font-weight: 500;
  margin: ${p => p.theme.padding.layout.large} 0 0 !important;
  opacity: 0.35;
  padding: ${p => p.theme.padding.layout.small} 0;
  text-transform: uppercase;
`

const UserMenu = styled.div`
  display: flex;
  justify-content: space-between;
  > a,
  > svg {
    color: white;
    display: block;
    opacity: 0.75;
    cursor: pointer;
    text-decoration: none;
    :hover {
      opacity: 1;
    }
  }
`

export default function Menu() {
  const { logOut, user } = useAuth<User>()

  return (
    <Container>
      <div>
        <Brand>Lab Agora</Brand>

        <MainMenu>
          <Link href="/admin">Suivi des projets</Link>

          <Link href="/admin/projects">Projets</Link>
          <Link href="/admin/organizations">Organisations</Link>
          <Link href="/admin/leads">Porteur·ses</Link>
          <Link href="/admin/contributors">Contributeur·rices</Link>
          <Link href="/admin/prospects">Prospect·es</Link>
          <Link href="/admin/contact-categories">Catégories de contact</Link>

          {user && user.role === Role.ADMINISTRATOR && (
            <>
              <MainMenuTitle>Administration</MainMenuTitle>

              <Link href="/admin/synchronizations">Synchronisations</Link>
              <Link href="/admin/users">Utilisateur·rices</Link>
            </>
          )}
        </MainMenu>
      </div>

      <UserMenu>
        <LogOut aria-label="Se déconnecter" onClick={logOut} role="button" />
      </UserMenu>
    </Container>
  )
}
