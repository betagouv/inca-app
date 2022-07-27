import { Role } from '@prisma/client'
import { useAuth } from 'nexauth/client'
import Link from 'next/link'
import styled from 'styled-components'

import type { User } from '@prisma/client'

const Container = styled.div`
  background-color: #293042;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 16rem;
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
    left: 1rem;
    position: absolute;
    width: calc(100% - 2rem);
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;

  > a {
    color: white;
    display: block;
    opacity: 0.75;
    padding: 0.5rem 1rem;
    text-decoration: none;

    :hover {
      opacity: 1;
    }
  }
`

export default function Menu() {
  const { user } = useAuth<User>()

  return (
    <Container>
      <div>
        <Brand>Lab Agora</Brand>

        <List>
          <Link href="/admin">Suivi des projets</Link>

          <Link href="/admin/projects">Projets</Link>
          <Link href="/admin/organizations">Organisations</Link>
          <Link href="/admin/leads">Porteur·ses</Link>
          <Link href="/admin/contributors">Contributeur·rices</Link>
          <Link href="/admin/prospects">Prospect·es</Link>
          <Link href="/admin/contact-categories">Catégories de contact</Link>

          {user && user.role === Role.ADMINISTRATOR && <Link href="/admin/users">Utilisateur·rices</Link>}
          {user && user.role === Role.ADMINISTRATOR && <Link href="/admin/synchronization">Synchronisation</Link>}
        </List>
      </div>
    </Container>
  )
}
